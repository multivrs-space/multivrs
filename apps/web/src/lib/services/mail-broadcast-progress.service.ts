import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

/** Progress a send keeps on the broadcast, so it can resume. */
export const progressSchema = z.object({
  recipients: z.number().default(0),
  prepared: z.number().default(0),
  failed: z.number().default(0),
  cursor: z.string().optional(),
});
export type BroadcastProgress = z.infer<typeof progressSchema>;

export async function failBroadcast(
  broadcastId: string,
  error: string,
  stats: object = {},
) {
  await prisma.mailBroadcast.update({
    where: { id: broadcastId },
    data: { status: "failed", stats: { ...stats, error } },
  });
}

/** Broadcasts whose copies have all left the queue are sent. */
export async function finishSentBroadcasts(): Promise<number> {
  const sending = await prisma.mailBroadcast.findMany({
    where: { status: "sending" },
    select: { id: true },
    take: 50,
  });
  let finished = 0;
  for (const { id } of sending) {
    const pending = await prisma.mailMessage.count({
      where: {
        status: { in: ["queued", "processing"] },
        events: { some: { broadcastId: id } },
      },
    });
    if (pending) continue;
    await prisma.mailBroadcast.update({
      where: { id },
      data: { status: "sent" },
    });
    finished += 1;
  }
  return finished;
}
