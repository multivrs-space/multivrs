"use client";

import type { MouseEvent } from "react";
import { ProjectRailNav } from "@/features/dashboard/components/shell/ProjectRailNav";
import { RailNavGroups } from "@/features/dashboard/components/shell/RailNavGroups";
import { useDashboardScope } from "@/features/dashboard/lib/useDashboardScope";

/** The workspace's sections, or the open project's own when inside one. */
export function ScopeRailNav(props: {
  narrow: boolean;
  onNavigate?: (slug: string, event: MouseEvent<HTMLElement>) => void;
}) {
  const { isAllProjects } = useDashboardScope();
  return isAllProjects ? (
    <RailNavGroups {...props} />
  ) : (
    <ProjectRailNav {...props} />
  );
}
