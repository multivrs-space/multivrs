/**
 * The warm machine an account's builds share: a hash of the account, so the
 * name is always safe and two accounts can never land on the same machine.
 */
export async function warmBuilderId(job: {
  accountId?: string;
  projectId: string;
}): Promise<string> {
  const owner = job.accountId ? `account:${job.accountId}` : `project:${job.projectId}`;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(owner));
  const hex = [...new Uint8Array(digest)]
    .slice(0, 16)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return `builder-${hex}`;
}
