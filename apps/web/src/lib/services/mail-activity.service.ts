import "server-only";
import type { MailActivityDay } from "@/features/mail/mail.types";
import { prisma } from "@/lib/prisma";
import { visibleMailboxWhere } from "@/lib/services/mail-access.service";

const DAYS = 30;
const DAY_MS = 86_400_000;

const EVENT_KEYS = {
  "email.delivered": "delivered",
  "email.opened": "opened",
  "email.clicked": "clicked",
  "email.bounced": "bounced",
  "email.complained": "complained",
} as const;

type Row = { day: Date; kind: string; count: bigint };

/**
 * Each of the last 30 UTC days for the mailboxes the viewer may see:
 * messages sent and received, and the provider events that followed.
 */
export async function mailActivity(
  ownerId: string,
  viewerId: string,
  projectId?: string,
): Promise<MailActivityDay[]> {
  const start = new Date(
    Math.floor(Date.now() / DAY_MS) * DAY_MS - (DAYS - 1) * DAY_MS,
  );
  const mailboxes = await prisma.mailbox.findMany({
    where: {
      userId: ownerId,
      ...(projectId ? { projectId } : {}),
      ...visibleMailboxWhere(viewerId),
    },
    select: { id: true },
  });
  const days = Array.from({ length: DAYS }, (_, index) =>
    emptyDay(new Date(start.getTime() + index * DAY_MS)),
  );
  if (!mailboxes.length) return days;
  const ids = mailboxes.map((mailbox) => mailbox.id);
  const rows = await prisma.$queryRaw<Row[]>`
    SELECT date_trunc('day', m."createdAt") AS day, m.direction AS kind, count(*) AS count
    FROM mail_messages m
    WHERE m."userId" = ${ownerId} AND m."mailboxId" = ANY(${ids}::text[]) AND m."createdAt" >= ${start}
    GROUP BY 1, 2
    UNION ALL
    SELECT date_trunc('day', e."occurredAt"), e.type, count(*)
    FROM mail_events e
    JOIN mail_messages m ON m.id = e."messageId"
    WHERE e."userId" = ${ownerId} AND e.type = ANY(${Object.keys(EVENT_KEYS)}::text[])
      AND e."occurredAt" >= ${start} AND m."mailboxId" = ANY(${ids}::text[])
    GROUP BY 1, 2`;
  for (const row of rows) {
    const day =
      days[Math.floor((row.day.getTime() - start.getTime()) / DAY_MS)];
    const key =
      row.kind === "outbound"
        ? "sent"
        : row.kind === "inbound"
          ? "received"
          : EVENT_KEYS[row.kind as keyof typeof EVENT_KEYS];
    if (day && key) day[key] += Number(row.count);
  }
  return days;
}

function emptyDay(date: Date): MailActivityDay {
  return {
    day: date.toISOString().slice(0, 10),
    sent: 0,
    received: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    complained: 0,
  };
}
