"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarAccountNav } from "@/features/dashboard/components/SidebarAccountNav";
import { SidebarFooter } from "@/features/dashboard/components/SidebarFooter";
import { SidebarMailNav } from "@/features/dashboard/components/SidebarMailNav";
import { SidebarObservabilityNav } from "@/features/dashboard/components/SidebarObservabilityNav";
import { SidebarSearch } from "@/features/dashboard/components/SidebarSearch";
import { SidebarTeamSettingsNav } from "@/features/dashboard/components/SidebarTeamSettingsNav";
import { ScopeRailNav } from "@/features/dashboard/components/shell/ScopeRailNav";
import { WorkspaceSwitcher } from "@/features/dashboard/components/WorkspaceSwitcher";
import type { DashboardContextNav } from "@/features/dashboard/constants/shell";
import { useContextNav } from "@/features/dashboard/lib/useContextNav";
import type { DashboardNotification } from "@/features/dashboard/types/notification.types";
import type {
  CurrentWorkspace,
  DashboardWorkspace,
} from "@/features/dashboard/types/workspace.types";

const PANEL_FOR_SLUG: Record<string, DashboardContextNav> = {
  emails: "mail",
  observability: "observability",
};

/** Keep the sheet open while a dropdown portalled out of it is open. */
function insideOpenMenu(event: Event) {
  if (document.querySelector("[data-radix-popper-content-wrapper]")) {
    event.preventDefault();
  }
}

/**
 * The phone and tablet navigation: a sheet with the same grouped sections as
 * the rail, and a section's own navigation when you are inside it.
 */
export function DashboardMobileNavigation({
  notifications,
  user,
  workspace,
  workspaces,
}: {
  notifications: DashboardNotification[];
  user: { email: string; image?: string | null; name: string };
  workspace: CurrentWorkspace;
  workspaces: DashboardWorkspace[];
}) {
  const routeNav = useContextNav();
  const [open, setOpen] = useState(false);
  const [override, setOverride] = useState<
    DashboardContextNav | "sections" | null
  >(null);
  const view = override ?? routeNav ?? "sections";
  const close = () => setOpen(false);
  const back = () => setOverride("sections");

  return (
    <Sheet
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setTimeout(() => setOverride(null), 300);
      }}
      open={open}
    >
      <SheetTrigger asChild>
        <button
          aria-label="Open navigation"
          className="surface-raised surface-press grid size-9 place-items-center rounded-full text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
          type="button"
        >
          <Menu className="size-4" />
        </button>
      </SheetTrigger>
      <SheetContent
        className="dashboard-surface flex w-76 flex-col gap-0 border-r border-hairline bg-ink-raised p-0 dark:bg-ink"
        onInteractOutside={insideOpenMenu}
        onOpenAutoFocus={(event) => event.preventDefault()}
        onPointerDownOutside={insideOpenMenu}
        side="left"
      >
        <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
        <div className="flex h-16 shrink-0 items-center px-3">
          <WorkspaceSwitcher workspace={workspace} workspaces={workspaces} />
        </div>
        {view === "mail" ? (
          <SidebarMailNav onBack={back} onLinkClick={close} />
        ) : view === "observability" ? (
          <SidebarObservabilityNav onBack={back} onLinkClick={close} />
        ) : view === "team-settings" ? (
          <SidebarTeamSettingsNav onBack={back} onLinkClick={close} />
        ) : view === "account" ? (
          <SidebarAccountNav onLinkClick={close} />
        ) : (
          <>
            <div className="px-3 pb-1">
              <SidebarSearch />
            </div>
            <nav className="hide-scrollbar flex-1 overflow-y-auto px-3 pb-3">
              <ScopeRailNav
                narrow={false}
                onNavigate={(slug, event) => {
                  const panel = PANEL_FOR_SLUG[slug];
                  if (panel) {
                    event.preventDefault();
                    setOverride(panel);
                  } else {
                    close();
                  }
                }}
              />
            </nav>
          </>
        )}
        <SidebarFooter
          {...user}
          notifications={notifications}
          plan={workspace.plan}
        />
      </SheetContent>
    </Sheet>
  );
}
