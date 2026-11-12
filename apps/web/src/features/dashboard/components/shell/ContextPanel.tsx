"use client";

import { Suspense } from "react";
import { SidebarAccountNav } from "@/features/dashboard/components/SidebarAccountNav";
import { SidebarMailNav } from "@/features/dashboard/components/SidebarMailNav";
import { SidebarObservabilityNav } from "@/features/dashboard/components/SidebarObservabilityNav";
import { SidebarTeamSettingsNav } from "@/features/dashboard/components/SidebarTeamSettingsNav";
import type { DashboardContextNav } from "@/features/dashboard/constants/shell";
import { useContextNav } from "@/features/dashboard/lib/useContextNav";

const LABELS: Record<DashboardContextNav, string> = {
  mail: "Mail",
  observability: "Monitoring",
  "team-settings": "Team settings",
  account: "Account",
};

function ContextNav({ nav }: { nav: DashboardContextNav }) {
  if (nav === "mail") return <SidebarMailNav />;
  if (nav === "observability") return <SidebarObservabilityNav />;
  if (nav === "team-settings") return <SidebarTeamSettingsNav />;
  return <SidebarAccountNav />;
}

/**
 * Second column beside the narrow rail for sections that have their own
 * navigation (Mail, Observability, Team settings, Account). It slides in, the
 * rail folds to icons, and the canvas moves over to make room.
 */
export function ContextPanel() {
  const nav = useContextNav();
  if (!nav) return null;
  return (
    <aside
      aria-label={LABELS[nav]}
      className="fixed inset-y-0 left-(--rail-w) z-30 hidden w-(--context-w) flex-col overflow-hidden pt-3 duration-300 ease-out-expo animate-in fade-in-0 slide-in-from-left-3 lg:flex"
      key={nav}
    >
      <Suspense fallback={<div className="flex-1" />}>
        <ContextNav nav={nav} />
      </Suspense>
    </aside>
  );
}
