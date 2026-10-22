import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { findAccountTeam } from "@/lib/services/account-team.service";

/**
 * Keeps authenticated users out of sign-in and recovery screens while still
 * allowing an unverified account to complete email verification.
 */
export async function redirectAuthenticatedUser({
  allowUnverified = false,
}: {
  allowUnverified?: boolean;
} = {}) {
  const session = await getServerSession();
  if (!session) return;

  if (!session.user.emailVerified) {
    if (allowUnverified) return;
    redirect(`/verify-email?email=${encodeURIComponent(session.user.email)}`);
  }

  const team = await findAccountTeam(session.user.id);
  const target = team?.slug ?? session.user.username;
  redirect(target ? `/${target}` : "/home");
}
