import "server-only";
import { prisma } from "@/lib/prisma";
import { finishSentBroadcasts } from "@/lib/services/mail-broadcast-progress.service";
import { sendBroadcast } from "@/lib/services/mail-broadcast-send.service";

/** A send saves its progress every few seconds; this long silent means it died. */
const STALLED_MS = 10 * 60_000;

export interface ScheduledMailJob {
  userId: string;
  messageId: string;
}

/**
 * Broadcasts that are due, sent one after another. Each hands its own copies
 * to delivery, so none of them come back as jobs here.
 */
async function sendDueBroadcasts() {
  // A send that stopped answering (its server went away) picks up where it saved.
  await prisma.mailBroadcast.updateMany({
    where: {
      status: "processing",
      updatedAt: { lt: new Date(Date.now() - STALLED_MS) },
    },
    data: { status: "scheduled" },
  });
  const due = await prisma.mailBroadcast.findMany({
    where: { status: "scheduled", scheduledAt: { lte: new Date() } },
    orderBy: { scheduledAt: "asc" },
    select: { id: true },
    take: 5,
  });
  for (const { id } of due) await sendBroadcast(id);
}

/** Scheduled single emails that are due, as delivery jobs for the queue. */
async function dueMessages(): Promise<ScheduledMailJob[]> {
  const scheduled = await prisma.mailMessage.findMany({
    where: { status: "scheduled", scheduledAt: { lte: new Date() } },
    select: { id: true, userId: true },
    take: 500,
  });
  const claimed = await Promise.all(
    scheduled.map(async (message) => {
      const { count } = await prisma.mailMessage.updateMany({
        where: { id: message.id, status: "scheduled" },
        data: { status: "queued" },
      });
      return count ? { userId: message.userId, messageId: message.id } : null;
    }),
  );
  return claimed.filter((job) => job !== null);
}

export async function prepareDueMailJobs(): Promise<ScheduledMailJob[]> {
  const [jobs] = await Promise.all([
    dueMessages(),
    sendDueBroadcasts(),
    finishSentBroadcasts(),
  ]);
  return jobs;
}
