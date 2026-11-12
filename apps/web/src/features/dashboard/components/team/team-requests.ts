import { squareImage } from "@/features/dashboard/lib/square-image";
import type { AccountTeam } from "@/lib/services/account-team.service";

async function errorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  const body = (await response.json().catch(() => ({}))) as {
    error?: string | { message?: string };
    message?: string;
  };
  if (typeof body.error === "string") return body.error;
  return body.error?.message || body.message || fallback;
}

/** Renames the team or changes its URL; resolves to the saved team. */
export async function updateTeam(
  patch: { name?: string; slug?: string },
  fallback: string,
): Promise<AccountTeam> {
  const response = await fetch("/api/team", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!response.ok) throw new Error(await errorMessage(response, fallback));
  return response.json();
}

export async function uploadTeamAvatar(file: File): Promise<AccountTeam> {
  const body = new FormData();
  body.set("file", await squareImage(file), "avatar.webp");
  const response = await fetch("/api/team/avatar", { method: "POST", body });
  if (!response.ok)
    throw new Error(await errorMessage(response, "Avatar upload failed"));
  return response.json();
}

export async function removeTeamAvatar(): Promise<AccountTeam> {
  const response = await fetch("/api/team/avatar", { method: "DELETE" });
  if (!response.ok)
    throw new Error(await errorMessage(response, "Failed to remove avatar"));
  return response.json();
}
