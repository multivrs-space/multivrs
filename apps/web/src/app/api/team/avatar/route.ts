/**
 * /api/team/avatar — your team's logo.
 *   POST   → upload an image (multipart `file`) and use it as your team logo
 *   DELETE → remove your team logo
 */
import { ValidationError } from "@multivrs/error-utils";
import { fail, ok } from "@/lib/api/respond";
import { requireSessionUserId } from "@/lib/api/session";
import {
  ensureAccountTeam,
  updateAccountTeam,
} from "@/lib/services/account-team.service";
import {
  deleteAvatar,
  uploadAvatar,
} from "@/lib/services/avatar-storage.service";

export async function POST(request: Request) {
  try {
    const userId = await requireSessionUserId();
    const file = (await request.formData()).get("file");
    if (!(file instanceof File)) {
      throw new ValidationError("Choose an image to upload");
    }
    const [team, image] = await Promise.all([
      ensureAccountTeam(userId),
      uploadAvatar(userId, file),
    ]);
    const updated = await updateAccountTeam(userId, { logo: image });
    if (team.logo) {
      await deleteAvatar(userId, team.logo);
    }
    return ok(updated);
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE() {
  try {
    const userId = await requireSessionUserId();
    const team = await ensureAccountTeam(userId);
    const updated = await updateAccountTeam(userId, { logo: null });
    if (team.logo) {
      await deleteAvatar(userId, team.logo);
    }
    return ok(updated);
  } catch (error) {
    return fail(error);
  }
}
