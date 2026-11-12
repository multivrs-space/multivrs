import "server-only";
import type {
  AudienceSummary,
  ContactProperty,
} from "@/features/mail/mail.types";
import { prisma } from "@/lib/prisma";

/**
 * The account's audience at a glance: how many contacts and how many can be
 * sent to, plus every custom property found on them, most used first.
 */
export async function audienceSummary(
  userId: string,
): Promise<AudienceSummary> {
  const [statuses, properties] = await Promise.all([
    prisma.mailContact.groupBy({
      by: ["status"],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.$queryRaw<ContactProperty[]>`
      SELECT p.key, count(*)::int AS contacts, min(p.value) AS example
      FROM "mail_contacts" AS c
      CROSS JOIN LATERAL jsonb_each_text(
        CASE WHEN jsonb_typeof(c."properties") = 'object' THEN c."properties" ELSE '{}'::jsonb END
      ) AS p(key, value)
      WHERE c."userId" = ${userId} AND p.value <> ''
      GROUP BY p.key
      ORDER BY contacts DESC, p.key
      LIMIT 100`,
  ]);
  const count = (status: string) =>
    statuses.find((row) => row.status === status)?._count._all ?? 0;
  return {
    total: statuses.reduce((sum, row) => sum + row._count._all, 0),
    subscribed: count("subscribed"),
    unsubscribed: count("unsubscribed"),
    properties: properties.map((row) => ({
      key: row.key,
      contacts: Number(row.contacts),
      example: String(row.example ?? "").slice(0, 80),
    })),
  };
}
