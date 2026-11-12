import "server-only";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/services/logger.service";
import { assertMailAllowance } from "@/lib/services/mail-allowance.service";
import {
  broadcastSender,
  sendBroadcastCopy,
} from "@/lib/services/mail-broadcast-copy.service";
import {
  type BroadcastProgress,
  failBroadcast,
  progressSchema,
} from "@/lib/services/mail-broadcast-progress.service";
import {
  type BroadcastRecipient,
  recipientCount,
  recipientPage,
  suppressedAddresses,
} from "@/lib/services/mail-broadcast-recipients.service";

/** Copies prepared at once; keeps database connections free for everyone else. */
const BATCH = 10;
const PAGE = 500;
/** Stop well inside the function's time limit; the next tick carries on. */
const BUDGET_MS = 240_000;

/**
 * Send a broadcast that's due: one personalised copy per recipient with its
 * own unsubscribe link, handed to delivery in small batches. A contact that
 * fails is counted and skipped; a send too big for one run resumes on the
 * next scheduler tick from where it stopped.
 */
export async function sendBroadcast(broadcastId: string): Promise<void> {
  const started = Date.now();
  const claimed = await prisma.mailBroadcast.updateMany({
    where: { id: broadcastId, status: "scheduled" },
    data: { status: "processing" },
  });
  if (!claimed.count) return;
  const broadcast = await prisma.mailBroadcast.findUniqueOrThrow({
    where: { id: broadcastId },
    include: { templateVersion: true },
  });
  const sender = await broadcastSender(broadcast);
  if (typeof sender === "string") return failBroadcast(broadcastId, sender);
  const mailbox = sender;

  const saved = progressSchema.safeParse(broadcast.stats ?? {});
  const progress: BroadcastProgress = saved.success
    ? saved.data
    : progressSchema.parse({});
  if (!progress.cursor) {
    progress.recipients = await recipientCount(
      broadcast.userId,
      broadcast.audienceId,
    );
    if (!progress.recipients)
      return failBroadcast(
        broadcastId,
        broadcast.audienceId
          ? "This segment has no subscribed contacts"
          : "You have no subscribed contacts",
      );
    try {
      // Checked once before the first copy, the way delivery meters each one.
      await assertMailAllowance(
        broadcast.userId,
        mailbox.projectId,
        progress.recipients,
      );
    } catch (error) {
      return failBroadcast(
        broadcastId,
        error instanceof Error ? error.message : "Usage limit reached",
        progress,
      );
    }
    await prisma.mailBroadcast.update({
      where: { id: broadcastId },
      data: { sentAt: new Date(), stats: progress },
    });
  }

  const suppressed = await suppressedAddresses(broadcast.userId);
  const copy = (contact: BroadcastRecipient) =>
    sendBroadcastCopy(broadcast, mailbox, contact);

  const save = (status?: "scheduled") =>
    prisma.mailBroadcast.update({
      where: { id: broadcastId },
      data: { stats: progress, ...(status ? { status } : {}) },
    });
  for (;;) {
    const page = await recipientPage(
      broadcast.userId,
      broadcast.audienceId,
      progress.cursor,
      PAGE,
    );
    if (!page.length) break;
    for (let start = 0; start < page.length; start += BATCH) {
      const batch = page.slice(start, start + BATCH);
      const reachable = batch.filter(
        (contact) => !suppressed.has(contact.email.toLowerCase()),
      );
      const results = await Promise.allSettled(reachable.map(copy));
      for (const result of results) {
        if (result.status === "fulfilled") progress.prepared += 1;
        else {
          progress.failed += 1;
          logError("mail.broadcast.copy_failed", result.reason, {
            broadcastId,
          });
        }
      }
      // Saved after every batch, so a crash re-sends at most one batch.
      progress.cursor = batch.at(-1)?.id;
      if (Date.now() - started > BUDGET_MS) {
        // Out of time: hand it back to the scheduler to carry on next tick.
        await save("scheduled");
        return;
      }
      await save();
    }
  }
  if (!progress.prepared)
    return failBroadcast(
      broadcastId,
      progress.failed
        ? "None of the copies could be sent"
        : "Every recipient is on your suppression list",
      progress,
    );
  // Delivery carries on in the queue; the scheduler marks it sent once it's done.
  await prisma.mailBroadcast.update({
    where: { id: broadcastId },
    data: { status: "sending" },
  });
}
