import type { CurrentWorkspace } from "@/features/dashboard/types/workspace.types";
import { accountPlan } from "@/lib/services/account-plan.service";
import {
  dashboardWorkspaces,
  workspaceOwner,
} from "@/lib/services/account-team.service";
import { dashboardProjectOptions } from "@/lib/services/dashboard.service";
import { listNotifications } from "@/lib/services/notification.service";

export interface ChromeViewer {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

/** Everything the dashboard chrome (either shell) needs, loaded in parallel. */
export async function loadDashboardChrome(
  user: ChromeViewer,
  workspaceName: string,
) {
  const [projects, notifications, plan, owner, workspaces] = await Promise.all([
    dashboardProjectOptions(workspaceName, user.id),
    listNotifications(user.id),
    accountPlan(workspaceName).catch((error: unknown) => {
      console.error("[DashboardChrome] accountPlan error:", error);
      return undefined;
    }),
    workspaceOwner(workspaceName),
    dashboardWorkspaces(user.id),
  ]);
  // The header shows the account being viewed, not the viewer.
  const workspace: CurrentWorkspace = {
    username: workspaceName,
    name: owner?.name ?? workspaceName,
    image: owner?.image ?? null,
    plan,
  };
  return {
    projects,
    notifications,
    workspace,
    workspaces,
    publicUser: { name: user.name, email: user.email, image: user.image },
  };
}
