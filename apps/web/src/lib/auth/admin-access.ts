import "server-only";

import { getServerSession } from "@/lib/auth/session";

/**
 * Who may open the internal admin area (`/admin`).
 *
 * The team is an explicit allowlist of emails in the ADMIN_EMAILS environment
 * variable (comma-separated, case-insensitive) rather than a database role:
 * there is no schema migration to run, and customer data never has a flag on
 * it that could leak into queries. An empty or unset variable disables the
 * admin area entirely — including for signed-in users — so it can never be
 * accidentally open.
 *
 * The check runs on the server in every admin layout and page; the allowlist
 * is never shipped to the client.
 */
export function getAdminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().has(email.trim().toLowerCase());
}

export type AdminAccess =
  | {
      allowed: true;
      session: Exclude<Awaited<ReturnType<typeof getServerSession>>, null>;
    }
  | { allowed: false };

/**
 * Resolve the current request against the admin allowlist. Call this from
 * server components under `/admin`; anything not allowlisted is rendered as
 * a 404 so the area does not exist for outsiders.
 */
export async function getAdminAccess(): Promise<AdminAccess> {
  const session = await getServerSession();

  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return { allowed: false };
  }

  return { allowed: true, session };
}
