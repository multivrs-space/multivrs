import { after } from "next/server";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { sendBroadcastNow } from "@/lib/services/mail-broadcast.service";
import { sendBroadcast } from "@/lib/services/mail-broadcast-send.service";

/** Send a draft now, or retry one that failed. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ broadcastId: string }> },
) {
  try {
    const { broadcastId } = await params;
    const broadcast = await sendBroadcastNow(
      await requireUserId(),
      broadcastId,
    );
    after(() => sendBroadcast(broadcast.id));
    return ok({ id: broadcast.id, status: broadcast.status });
  } catch (error) {
    return fail(error);
  }
}
