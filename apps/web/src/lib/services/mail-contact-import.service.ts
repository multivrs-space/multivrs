import "server-only";
import { NotFoundError } from "@multivrs/error-utils";
import type { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { importMailContactsSchema } from "@/lib/schemas/mail-resource.schemas";
import { mailAccount } from "@/lib/services/mail-access.service";

type ImportInput = z.infer<typeof importMailContactsSchema>;
type ImportedContact = ImportInput["contacts"][number];

export interface ContactImportResult {
  created: number;
  updated: number;
  unchanged: number;
  addedToAudience: number;
}

/** One row per address; later rows fill blanks and add tags. */
function uniqueContacts(input: ImportInput): ImportedContact[] {
  const byEmail = new Map<string, ImportedContact>();
  for (const contact of input.contacts) {
    const earlier = byEmail.get(contact.email);
    byEmail.set(contact.email, {
      email: contact.email,
      firstName: earlier?.firstName ?? contact.firstName,
      lastName: earlier?.lastName ?? contact.lastName,
      tags: [
        ...new Set([...(earlier?.tags ?? input.tags), ...contact.tags]),
      ].slice(0, 30),
      properties:
        earlier?.properties || contact.properties
          ? { ...contact.properties, ...earlier?.properties }
          : undefined,
    });
  }
  return [...byEmail.values()];
}

/**
 * Add a batch of contacts in a few queries however large it is. New
 * addresses are created; existing ones only gain names they lack and new
 * tags, and their subscription status is never touched, so an import can't
 * resubscribe someone who opted out.
 */
export async function importContacts(
  actorId: string,
  input: ImportInput,
): Promise<ContactImportResult> {
  const { ownerId: userId } = await mailAccount(actorId, input);
  const contacts = uniqueContacts(input);
  const emails = contacts.map((contact) => contact.email);
  return prisma.$transaction(
    async (tx) => {
      const [existing, audience] = await Promise.all([
        tx.mailContact.findMany({
          where: { userId, email: { in: emails } },
          select: { id: true, email: true },
        }),
        input.audienceId
          ? tx.mailAudience.findFirst({
              where: { id: input.audienceId, userId },
              select: { id: true },
            })
          : null,
      ]);
      if (input.audienceId && !audience)
        throw new NotFoundError("Audience not found");
      const known = new Set(existing.map((contact) => contact.email));
      const consentAt = new Date();
      const created = await tx.mailContact.createManyAndReturn({
        data: contacts
          .filter((contact) => !known.has(contact.email))
          .map((contact) => ({
            ...contact,
            userId,
            consentAt,
            source: "import",
          })),
        skipDuplicates: true,
        select: { id: true },
      });
      const rows = contacts.filter((contact) => known.has(contact.email));
      const updated = rows.length
        ? await tx.$executeRaw`
            UPDATE "mail_contacts" AS c SET
              "firstName" = COALESCE(c."firstName", v."firstName"),
              "lastName" = COALESCE(c."lastName", v."lastName"),
              "tags" = COALESCE((SELECT array_agg(DISTINCT t) FROM unnest(c."tags" || ARRAY(SELECT jsonb_array_elements_text(v."tags"))) AS t), '{}'),
              "properties" = CASE WHEN v."properties" IS NULL THEN c."properties"
                ELSE (CASE WHEN jsonb_typeof(c."properties") = 'object' THEN c."properties" ELSE '{}'::jsonb END) || v."properties" END,
              "updatedAt" = now()
            FROM jsonb_to_recordset(${JSON.stringify(rows)}::jsonb)
              AS v("email" text, "firstName" text, "lastName" text, "tags" jsonb, "properties" jsonb)
            WHERE c."userId" = ${userId} AND c."email" = v."email" AND (
              (c."firstName" IS NULL AND v."firstName" IS NOT NULL) OR
              (c."lastName" IS NULL AND v."lastName" IS NOT NULL) OR
              NOT (c."tags" @> ARRAY(SELECT jsonb_array_elements_text(v."tags"))) OR
              (v."properties" IS NOT NULL AND NOT (COALESCE(c."properties", '{}'::jsonb) @> v."properties"))
            )`
        : 0;
      const ids = [...created, ...existing].map((contact) => contact.id);
      const joined = audience
        ? await tx.mailAudienceMember.createMany({
            data: ids.map((contactId) => ({
              audienceId: audience.id,
              contactId,
            })),
            skipDuplicates: true,
          })
        : { count: 0 };
      return {
        created: created.length,
        updated,
        unchanged: existing.length - updated,
        addedToAudience: joined.count,
      };
    },
    { timeout: 30_000 },
  );
}
