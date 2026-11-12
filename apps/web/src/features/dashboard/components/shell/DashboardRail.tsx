"use client";

import { LiveHelp, LivePanelLeft } from "@/components/icons/animated";
import { RailItem } from "@/features/dashboard/components/shell/RailItem";
import { RailNavLink } from "@/features/dashboard/components/shell/RailNavGroups";
import { useRail } from "@/features/dashboard/components/shell/rail-context";
import { ScopeRailNav } from "@/features/dashboard/components/shell/ScopeRailNav";
import { WorkspaceSwitcher } from "@/features/dashboard/components/WorkspaceSwitcher";
import { DASHBOARD_NAV_ITEMS } from "@/features/dashboard/constants/navigation";
import { useContextNav } from "@/features/dashboard/lib/useContextNav";
import type {
  CurrentWorkspace,
  DashboardWorkspace,
} from "@/features/dashboard/types/workspace.types";

interface DashboardRailProps {
  workspace: CurrentWorkspace;
  workspaces: DashboardWorkspace[];
}

const SETTINGS = DASHBOARD_NAV_ITEMS.find((item) => item.group === "settings");

/**
 * The left rail: workspace, every section grouped by layer, and settings,
 * help and the collapse key at its foot. Folds to icons when collapsed or
 * when a section's own navigation opens beside it.
 */
export function DashboardRail({ workspace, workspaces }: DashboardRailProps) {
  const { narrow, collapsed, toggle } = useRail();
  const contextNav = useContextNav();

  return (
    <aside
      aria-label="Dashboard"
      className="fixed inset-y-0 left-0 z-40 hidden w-(--rail-w) flex-col overflow-hidden transition-[width] duration-300 ease-out-expo lg:flex"
    >
      <div className="flex h-16 shrink-0 items-center px-3">
        <WorkspaceSwitcher
          compact={narrow}
          workspace={workspace}
          workspaces={workspaces}
        />
      </div>

      <nav className="hide-scrollbar flex-1 overflow-y-auto overflow-x-hidden px-3 pb-3">
        <ScopeRailNav narrow={narrow} />
      </nav>

      <div className="flex shrink-0 flex-col gap-0.5 border-t border-hairline px-3 py-3">
        {SETTINGS ? <RailNavLink item={SETTINGS} narrow={narrow} /> : null}
        <RailItem href="/help" icon={LiveHelp} label="Help" narrow={narrow} />
        {contextNav ? null : (
          <RailItem
            icon={LivePanelLeft}
            label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            narrow={narrow}
            onClick={toggle}
            trailing={
              <kbd className="surface-raised rounded-[5px] px-1.5 font-geist-mono text-[10px] leading-4 text-muted-foreground">
                [
              </kbd>
            }
          />
        )}
      </div>
    </aside>
  );
}
