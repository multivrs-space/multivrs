import {
  DASHBOARD_NAV_ITEMS,
  type DashboardNavItem,
} from "@/features/dashboard/constants/navigation";

/**
 * Inside a project the rail lists only that project's sections, in the same
 * layers as the workspace. Workspace-wide pages (the project list, the
 * template store) stay in the workspace rail.
 */
const PROJECT_GROUPS: readonly {
  id: string;
  label: string;
  slugs: readonly string[];
}[] = [
  { id: "home", label: "", slugs: ["", "deployments"] },
  {
    id: "observe",
    label: "Observe",
    // Grouped by the question each answers; Product, Traces and Uptime are
    // tabs inside Analytics, Performance and Monitoring.
    slugs: [
      "analytics",
      "errors",
      "logs",
      "speed-insights",
      "observability",
      "alerts",
    ],
  },
  { id: "deliver", label: "Deliver", slugs: ["domains", "firewall", "cdn"] },
  {
    id: "configure",
    label: "Configure",
    slugs: ["environment-variables", "integrations"],
  },
  { id: "run", label: "Run", slugs: ["sandboxes", "workflows"] },
  { id: "communicate", label: "Communicate", slugs: ["emails"] },
];

export interface ProjectNavGroup {
  id: string;
  label: string;
  items: DashboardNavItem[];
}

export const PROJECT_NAV_GROUPS: readonly ProjectNavGroup[] =
  PROJECT_GROUPS.map((group) => ({
    id: group.id,
    label: group.label,
    items: group.slugs.flatMap((slug) => {
      const item = DASHBOARD_NAV_ITEMS.find((entry) => entry.slug === slug);
      return item ? [item] : [];
    }),
  }));
