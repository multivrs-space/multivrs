import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ownedOrTeamWhere } from "@/lib/services/account-access";

const statsSchema = z.object({
  recipients: z.number().optional(),
  prepared: z.number().optional(),
  failed: z.number().optional(),
  error: z.string().optional(),
});

export interface BroadcastCounts {
  recipients: number;
  prepared: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  failed: number;
}

/** How a broadcast's copies are doing, counted from their messages and events. */
async function broadcastCounts(
  broadcastId: string,
  stats: z.infer<typeof statsSchema>,
) {
  const copies = { events: { some: { broadcastId } } };
  const [statuses, engagement] = await Promise.all([
    prisma.mailMessage.groupBy({
      by: ["status"],
      where: copies,
      _count: { _all: true },
    }),
    prisma.mailEvent.groupBy({
      by: ["type", "messageId"],
      where: {
        type: { in: ["email.opened", "email.clicked"] },
        message: copies,
      },
    }),
  ]);
  const byStatus = (names: string[]) =>
    statuses
      .filter((row) => names.includes(row.status))
      .reduce((sum, row) => sum + row._count._all, 0);
  const people = (type: string) =>
    engagement.filter((row) => row.type === type).length;
  return {
    recipients: stats.recipients ?? 0,
    prepared: stats.prepared ?? 0,
    sent: byStatus(["sent", "delivered", "bounced", "complained", "deferred"]),
    delivered: byStatus(["delivered"]),
    opened: people("email.opened"),
    clicked: people("email.clicked"),
    bounced: byStatus(["bounced", "complained"]),
    failed: byStatus(["failed"]) + (stats.failed ?? 0),
  } satisfies BroadcastCounts;
}

/** A broadcast the viewer can see, with what it said and how it's going. */
export async function broadcastDetail(viewerId: string, broadcastId: string) {
  const broadcast = await prisma.mailBroadcast.findFirst({
    where: { id: broadcastId, OR: ownedOrTeamWhere(viewerId) },
    include: {
      audience: { select: { id: true, name: true } },
      templateVersion: { select: { html: true, text: true } },
    },
  });
  if (!broadcast) return null;
  const parsed = statsSchema.safeParse(broadcast.stats ?? {});
  const stats = parsed.success ? parsed.data : {};
  return {
    id: broadcast.id,
    name: broadcast.name,
    subject: broadcast.subject,
    fromAddress: broadcast.fromAddress,
    status: broadcast.status,
    segment: broadcast.audience?.name ?? null,
    html: broadcast.templateVersion?.html ?? null,
    text: broadcast.templateVersion?.text ?? null,
    error: stats.error ?? null,
    createdAt: broadcast.createdAt.toISOString(),
    scheduledAt: broadcast.scheduledAt?.toISOString() ?? null,
    sentAt: broadcast.sentAt?.toISOString() ?? null,
    counts: await broadcastCounts(broadcast.id, stats),
  };
}

export type BroadcastDetail = NonNullable<
  Awaited<ReturnType<typeof broadcastDetail>>
>;
