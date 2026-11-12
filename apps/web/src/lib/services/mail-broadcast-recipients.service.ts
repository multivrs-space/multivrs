import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Subscribed contacts, in the segment when there is one. */
function recipientWhere(
  userId: string,
  audienceId: string | null,
): Prisma.MailContactWhereInput {
  return {
    userId,
    status: "subscribed",
    ...(audienceId
      ? { audiences: { some: { audienceId, subscriptionState: "subscribed" } } }
      : {}),
  };
}

/** How many people a broadcast reaches, before suppressions. */
export function recipientCount(userId: string, audienceId: string | null) {
  return prisma.mailContact.count({
    where: recipientWhere(userId, audienceId),
  });
}

export async function suppressedAddresses(
  userId: string,
): Promise<Set<string>> {
  const rows = await prisma.mailSuppression.findMany({
    where: { userId },
    select: { email: true },
  });
  return new Set(rows.map((row) => row.email.toLowerCase()));
}

/**
 * The next page of recipients after `cursor`, in a stable order, so a send
 * that stops part way resumes exactly where it left off.
 */
export function recipientPage(
  userId: string,
  audienceId: string | null,
  cursor: string | undefined,
  take: number,
) {
  return prisma.mailContact.findMany({
    where: {
      ...recipientWhere(userId, audienceId),
      ...(cursor ? { id: { gt: cursor } } : {}),
    },
    orderBy: { id: "asc" },
    take,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      properties: true,
    },
  });
}

export type BroadcastRecipient = Awaited<
  ReturnType<typeof recipientPage>
>[number];
