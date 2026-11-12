import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { deleteBroadcast } from "@/lib/services/mail-broadcast.service";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ broadcastId: string }> },
) {
  try {
    const { broadcastId } = await params;
    await deleteBroadcast(await requireUserId(), broadcastId);
    return ok({ success: true });
  } catch (error) {
    return fail(error);
  }
}
