/** Moves, marks or stars one message; throws when the server says no. */
export async function updateMessage(messageId: string, action: string) {
  const response = await fetch(`/api/mail/messages/${messageId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action }),
  });
  if (!response.ok) throw new Error("Mail action failed");
}

/** Permanently deletes everything in Trash for a project or account. */
export async function emptyTrashRequest(
  target: Record<string, string>,
): Promise<boolean> {
  const query = new URLSearchParams(target).toString();
  const response = await fetch(
    `/api/mail/messages${query ? `?${query}` : ""}`,
    { method: "DELETE" },
  ).catch(() => null);
  return Boolean(response?.ok);
}
