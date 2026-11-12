"use client";

import { usePathname } from "next/navigation";
import type { DashboardContextNav } from "@/features/dashboard/constants/shell";
import { useDashboardScope } from "@/features/dashboard/lib/useDashboardScope";

/** The section whose own sub-navigation should open beside the rail, if any. */
export function useContextNav(): DashboardContextNav | null {
  const pathname = usePathname();
  const { activeSlug, isAllProjects } = useDashboardScope();
  if (pathname.startsWith("/account")) return "account";
  if (activeSlug === "emails" || activeSlug === "email") return "mail";
  if (activeSlug === "observability") return "observability";
  // A project's settings are one page of cards; only the team's have sections.
  if (activeSlug === "settings" && isAllProjects) return "team-settings";
  return null;
}
