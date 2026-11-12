import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { DashboardMobileNavigation } from "@/features/dashboard/components/DashboardMobileNavigation";
import { DashboardTopbar } from "@/features/dashboard/components/DashboardTopbar";
import { ContextPanel } from "@/features/dashboard/components/shell/ContextPanel";
import { DashboardCanvas } from "@/features/dashboard/components/shell/DashboardCanvas";
import { DashboardFrame } from "@/features/dashboard/components/shell/DashboardFrame";
import { DashboardRail } from "@/features/dashboard/components/shell/DashboardRail";
import { TopbarActions } from "@/features/dashboard/components/shell/TopbarActions";
import { RAIL_COOKIE } from "@/features/dashboard/constants/shell";
import {
  type ChromeViewer,
  loadDashboardChrome,
} from "@/features/dashboard/lib/load-dashboard-chrome";

interface DashboardShellProps {
  user: ChromeViewer;
  workspaceName: string;
  children: ReactNode;
  /** Sheets and dialogs that live outside the canvas, e.g. the upgrade sheet. */
  overlay?: ReactNode;
}

/**
 * The chrome around every dashboard page: the rail, the context panel for
 * sections with their own navigation, and the framed canvas with its top bar.
 */
export async function DashboardShell({
  user,
  workspaceName,
  children,
  overlay,
}: DashboardShellProps) {
  const [chrome, cookieStore] = await Promise.all([
    loadDashboardChrome(user, workspaceName),
    cookies(),
  ]);
  const { projects, notifications, workspace, workspaces, publicUser } = chrome;

  return (
    <DashboardFrame
      initialCollapsed={cookieStore.get(RAIL_COOKIE)?.value === "collapsed"}
    >
      <DashboardRail workspace={workspace} workspaces={workspaces} />
      <ContextPanel />
      <DashboardCanvas
        topbar={
          <DashboardTopbar
            actions={
              <TopbarActions
                notifications={notifications}
                plan={workspace.plan}
                user={publicUser}
              />
            }
            mobileNavigation={
              <DashboardMobileNavigation
                notifications={notifications}
                user={publicUser}
                workspace={workspace}
                workspaces={workspaces}
              />
            }
            projects={projects}
          />
        }
      >
        {children}
      </DashboardCanvas>
      {overlay}
    </DashboardFrame>
  );
}
