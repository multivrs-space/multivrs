import { after } from "next/server";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { createMailBroadcastSchema } from "@/lib/schemas/mail-resource.schemas";
import { sendBroadcast } from "@/lib/services/mail-broadcast-send.service";
import { createBroadcast } from "@/lib/services/mail-resource.service";

export async function POST(request: Request) {
  try {
    const broadcast = await createBroadcast(
      await requireUserId(),
      await parseBody(request, createMailBroadcastSchema),
    );
    // Due now: start sending once the response is out, not on the next tick.
    if (
      broadcast.status === "scheduled" &&
      broadcast.scheduledAt &&
      broadcast.scheduledAt <= new Date()
    )
      after(() => sendBroadcast(broadcast.id));
    return ok(broadcast, 201);
  } catch (error) {
    return fail(error);
  }
}
