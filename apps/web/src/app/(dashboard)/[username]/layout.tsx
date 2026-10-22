import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { AccountChrome } from "@/features/dashboard/components/AccountChrome";
import { UpgradeSheet } from "@/features/dashboard/components/UpgradeSheet";
import { getServerSession } from "@/lib/auth/session";
import { getProPlan } from "@/lib/payments/pricing";
import { accountPlan } from "@/lib/services/billing-entitlement.service";
import { dashboardWorkspaces } from "@/lib/services/account-team.service";
import { canAccessDashboardWorkspace } from "@/lib/services/dashboard-scope.service";

export const instant = false;

/**
 * Account-scoped chrome served around every page under /[username]. Renders the
 * premium dashboard rail. The parent (dashboard) layout already gates auth and
 * email verification; here we read the session for the user/workspace UI.
 */
export default async function AccountLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}>) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const { username } = await params;
  const [proPlan, currentPlan, workspaces] = await Promise.all([
    getProPlan().catch((err) => {
      console.error("[AccountLayout] getProPlan error:", err);
      return null;
    }),
    accountPlan(username).catch(() => "hobby"),
    dashboardWorkspaces(session.user.id).catch(() => []),
  ]);

  if (
    session.user.username !== username &&
    !(await canAccessDashboardWorkspace(session.user.id, username))
  ) {
    notFound();
  }

  return (
    <div className="dashboard-surface min-h-screen bg-(--ink) text-foreground">
      <AccountChrome
        user={{
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        }}
        workspaceName={username}
      />
      <div className="lg:pl-67 min-w-0 max-w-full">
        <div className="h-14" aria-hidden="true" />
        <main className="min-h-[calc(100vh-3.5rem)] min-w-0 max-w-full">{children}</main>
      </div>
      <Suspense fallback={null}>
        <UpgradeSheet
          currentPlan={currentPlan}
          user={{
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
            username: session.user.username ?? username,
          }}
          workspaceName={username}
          workspaces={workspaces}
          features={proPlan?.features}
          featureDescriptions={proPlan?.metadata}
        />
      </Suspense>
    </div>
  );
}
