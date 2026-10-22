"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashboardScope } from "@/features/dashboard/lib/useDashboardScope";
import type { DashboardNotification } from "@/features/dashboard/types/notification.types";
import type {
  CurrentWorkspace,
  DashboardWorkspace,
} from "@/features/dashboard/types/workspace.types";
import { SidebarAccountNav } from "./SidebarAccountNav";
import { SidebarFooter } from "./SidebarFooter";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarMailNav } from "./SidebarMailNav";
import { SidebarNav } from "./SidebarNav";
import { SidebarObservabilityNav } from "./SidebarObservabilityNav";
import { SidebarSearch } from "./SidebarSearch";
import { SidebarTeamSettingsNav } from "./SidebarTeamSettingsNav";

export interface SidebarProps {
  user: { name: string; email: string; image?: string | null };
  workspace: CurrentWorkspace;
  workspaces: DashboardWorkspace[];
  notifications: DashboardNotification[];
}

export function Sidebar({
  user,
  workspace,
  workspaces,
  notifications,
}: SidebarProps) {
  const pathname = usePathname();
  const { activeSlug, username } = useDashboardScope();
  const isEmails = activeSlug === "emails" || activeSlug === "email";
  const isObservability = activeSlug === "observability";
  const isTeamSettings = activeSlug === "settings";
  const isAccount = pathname.startsWith("/account");

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[268px] flex-col border-r border-[var(--hairline)] bg-[var(--ink)] lg:flex">
      {isAccount ? (
        <div className="flex h-14 shrink-0 items-center border-b border-[var(--hairline)] px-3">
          <Link
            href={workspaces[0]?.username ? `/${workspaces[0].username}` : "/home"}
            className="group flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back</span>
          </Link>
        </div>
      ) : isTeamSettings ? (
        <div className="flex h-14 shrink-0 items-center border-b border-[var(--hairline)] px-3">
          <Link
            href={`/${username || workspace.username}`}
            className="group flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="font-semibold text-foreground">Settings</span>
          </Link>
        </div>
      ) : (
        <SidebarHeader workspace={workspace} workspaces={workspaces} />
      )}

      {isAccount ? (
        <SidebarAccountNav />
      ) : isTeamSettings ? (
        <SidebarTeamSettingsNav />
      ) : isEmails ? (
        <SidebarMailNav />
      ) : isObservability ? (
        <SidebarObservabilityNav />
      ) : (
        <>
          <div className="px-3 pb-1 pt-3">
            <SidebarSearch />
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar">
            <SidebarNav />
          </div>
        </>
      )}

      <SidebarFooter
        {...user}
        notifications={notifications}
        plan={workspace.plan}
      />
    </aside>
  );
}
