"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ALL_PROJECTS_SCOPE } from "@/features/dashboard/constants/navigation";
import type { ProjectNavSummary } from "@/features/dashboard/types/project-summary.types";
import { projectNavSummarySchema } from "@/lib/schemas/project-summary.schemas";

/** Last answer per project, so moving between its pages never blanks the rail. */
const seen = new Map<string, ProjectNavSummary>();

/**
 * The open project's name, logo, status and section counts for the rail.
 * Re-read on every page change, so a count updates right after you add a
 * domain or a variable.
 */
export function useProjectSummary(
  username: string,
  scope: string,
): ProjectNavSummary | null {
  const pathname = usePathname();
  const key = `${username}/${scope}`;
  const [summary, setSummary] = useState<ProjectNavSummary | null>(
    () => seen.get(key) ?? null,
  );
  useEffect(() => {
    if (!pathname || scope === ALL_PROJECTS_SCOPE) return;
    let active = true;
    const query = new URLSearchParams({ account: username, project: scope });
    fetch(`/api/dashboard/project-summary?${query.toString()}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => {
        const parsed = projectNavSummarySchema.safeParse(body);
        if (!active || !parsed.success) return;
        seen.set(`${username}/${scope}`, parsed.data);
        setSummary(parsed.data);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [pathname, username, scope]);
  if (summary?.slug === scope) return summary;
  return seen.get(key) ?? null;
}
