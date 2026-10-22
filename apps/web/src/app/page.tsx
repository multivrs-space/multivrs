import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getServerSession } from "@/lib/auth/session";
import { findAccountTeam } from "@/lib/services/account-team.service";

/**
 * Root route ("/").
 *
 * This page never renders UI — it only decides where to send the visitor,
 * mirroring how vercel.com works:
 *   - Logged out      -> /home   (marketing landing)
 *   - Logged in       -> /<team-slug>  (their team dashboard, e.g. /c-tech)
 *   - Logged in, but
 *     no username yet -> /signup?step=username  (finish onboarding)
 *
 * The Proxy (proxy.ts) does a fast, optimistic cookie check for the same
 * redirect so logged-out users never even reach this server component. This
 * page is the authoritative fallback that actually reads the session.
 */
export default function RootPage() {
  return (
    <Suspense fallback={null}>
      <RootRedirect />
    </Suspense>
  );
}

async function RootRedirect() {
  const session = await getServerSession();

  if (!session) {
    return redirect("/home");
  }

  const team = await findAccountTeam(session.user.id);
  const targetSlug = team?.slug ?? session.user.username;
  if (!targetSlug) {
    return redirect("/signup?step=username");
  }

  return redirect(`/${targetSlug}`);
}
