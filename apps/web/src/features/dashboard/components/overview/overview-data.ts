import "server-only";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { getServerSession } from "@/lib/auth/session";
import { getAccountUsage } from "@/lib/services/account-usage.service";
import { dashboardProjects } from "@/lib/services/dashboard.service";
import { dashboardDeployments } from "@/lib/services/dashboard-deployments.service";
import { canAccessDashboardWorkspace } from "@/lib/services/dashboard-scope.service";
import { dashboardDomains } from "@/lib/services/domain.service";
import { mailAccount } from "@/lib/services/mail-access.service";
import { mailActivity } from "@/lib/services/mail-activity.service";

/**
 * Loaders for the workspace overview. Each card awaits only what it shows;
 * `cache` shares a query between cards within one request.
 */

/** The signed-in viewer, if they may see this workspace; otherwise a 404. */
export const overviewViewer = cache(async (username: string) => {
  const session = await getServerSession();
  if (!session) redirect("/login");
  if (
    session.user.username !== username &&
    !(await canAccessDashboardWorkspace(session.user.id, username))
  )
    notFound();
  return {
    userId: session.user.id,
    firstName: session.user.name.split(" ")[0] || session.user.name,
  };
});

export const overviewProjects = cache(
  async (username: string) =>
    (await dashboardProjects(
      username,
      (
        await overviewViewer(username)
      ).userId,
    )) ?? [],
);

export const overviewUsage = cache(async (username: string) =>
  getAccountUsage((await overviewViewer(username)).userId, username),
);

export const overviewDeployments = cache(
  async (username: string) =>
    (await dashboardDeployments(
      (
        await overviewViewer(username)
      ).userId,
      username,
    )) ?? [],
);

export const overviewDomains = cache(async (username: string) =>
  dashboardDomains((await overviewViewer(username)).userId, username),
);

/** 30 days of mail, or null when the viewer has no mail access here. */
export const overviewMail = cache(async (username: string) => {
  const { userId } = await overviewViewer(username);
  try {
    const { ownerId } = await mailAccount(
      userId,
      { account: username },
      "read",
    );
    return await mailActivity(ownerId, userId);
  } catch {
    return null;
  }
});
