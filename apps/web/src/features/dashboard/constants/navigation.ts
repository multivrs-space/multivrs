import type { AnimatedIcon } from "@/components/icons/animated";
import {
  LiveActivity,
  LiveAtSign,
  LiveBell,
  LiveBug,
  LiveGantt,
  LiveGauge,
  LiveGlobe,
  LiveHeartPulse,
  LiveHome,
  LiveKeyRound,
  LiveLayoutGrid,
  LiveNetwork,
  LivePlugZap,
  LivePointerClick,
  LiveRadar,
  LiveRocket,
  LiveScrollText,
  LiveSettings,
  LiveShieldCheck,
  LiveSquareTerminal,
  LiveStore,
  LiveWorkflow,
} from "@/components/icons/animated";

/**
 * The scope segment that means "all projects" in the account view — mirrors
 * Vercel's `~`. URLs read `/[username]/~/cdn`. A specific project swaps `~`
 * for the project slug: `/[username]/kontinue-ai/cdn`.
 */
export const ALL_PROJECTS_SCOPE = "~";

/** `/[username]/new` — the account-level New Project page, not a project scope. */
export const NEW_PROJECT_SLUG = "new";

export interface DashboardNavItem {
  /** Display label. */
  name: string;
  /** Trailing URL segment, e.g. `cdn`. Empty string = the scope root. */
  slug: string;
  icon: AnimatedIcon;
  /** Rail section the item is listed under. */
  group: DashboardNavGroup;
  /** Optional pill, e.g. "Beta". */
  badge?: string;
  /**
   * A tab of another section (Product under Analytics, Traces under
   * Performance): left out of the rail, and its parent stays lit on it.
   */
  parent?: string;
}

export type DashboardNavGroup =
  | "home"
  | "build"
  | "observe"
  | "deliver"
  | "configure"
  | "run"
  | "communicate"
  | "grow"
  | "settings";

/** Rail section labels, in display order. `settings` is pinned to the rail foot. */
export const DASHBOARD_NAV_GROUPS: readonly {
  id: Exclude<DashboardNavGroup, "settings">;
  /** Empty for the unlabelled group at the top of the rail. */
  label: string;
}[] = [
  { id: "home", label: "" },
  { id: "build", label: "Build" },
  { id: "observe", label: "Observe" },
  { id: "deliver", label: "Deliver" },
  { id: "configure", label: "Configure" },
  { id: "run", label: "Run" },
  { id: "communicate", label: "Communicate" },
  { id: "grow", label: "Grow" },
];

/**
 * Account-level navigation. `Overview` is the scope root (`/[username]` for
 * the workspace, `/[username]/[project]` for a project). `Projects` always
 * lists the whole workspace at `/[username]/~/projects`; everything else
 * hangs off the scope segment.
 */
export const DASHBOARD_NAV_ITEMS: readonly DashboardNavItem[] = [
  { name: "Overview", slug: "", group: "home", icon: LiveHome },
  {
    name: "Projects",
    slug: "projects",
    group: "build",
    icon: LiveLayoutGrid,
    badge: "Beta",
  },
  {
    name: "Deployments",
    slug: "deployments",
    group: "build",
    icon: LiveRocket,
    badge: "Beta",
  },
  {
    name: "Analytics",
    slug: "analytics",
    group: "observe",
    icon: LiveActivity,
  },
  {
    name: "Product Analytics",
    slug: "product",
    group: "observe",
    icon: LivePointerClick,
    badge: "Beta",
    parent: "analytics",
  },
  {
    name: "Errors",
    slug: "errors",
    group: "observe",
    icon: LiveBug,
    badge: "Beta",
  },
  {
    name: "Logs",
    slug: "logs",
    group: "observe",
    icon: LiveScrollText,
    badge: "Beta",
  },
  {
    name: "Performance",
    slug: "speed-insights",
    group: "observe",
    icon: LiveGauge,
  },
  {
    name: "Traces",
    slug: "traces",
    group: "observe",
    icon: LiveGantt,
    parent: "speed-insights",
  },
  {
    name: "Monitoring",
    slug: "observability",
    group: "observe",
    icon: LiveRadar,
  },
  {
    name: "Uptime",
    slug: "uptime",
    group: "observe",
    icon: LiveHeartPulse,
    badge: "Soon",
    parent: "observability",
  },
  {
    name: "Alerts",
    slug: "alerts",
    group: "observe",
    icon: LiveBell,
    badge: "Soon",
  },
  {
    name: "Firewall",
    slug: "firewall",
    group: "deliver",
    icon: LiveShieldCheck,
    badge: "Soon",
  },
  {
    name: "CDN",
    slug: "cdn",
    group: "deliver",
    icon: LiveNetwork,
    badge: "Soon",
  },
  {
    name: "Environment Variables",
    slug: "environment-variables",
    group: "configure",
    icon: LiveKeyRound,
    badge: "Soon",
  },
  {
    name: "Integrations",
    slug: "integrations",
    group: "configure",
    icon: LivePlugZap,
    badge: "Soon",
  },
  {
    name: "Sandboxes",
    slug: "sandboxes",
    group: "run",
    icon: LiveSquareTerminal,
    badge: "Soon",
  },
  {
    name: "Workflows",
    slug: "workflows",
    group: "run",
    icon: LiveWorkflow,
    badge: "Soon",
  },
  { name: "Domains", slug: "domains", group: "deliver", icon: LiveGlobe },
  { name: "Emails", slug: "emails", group: "communicate", icon: LiveAtSign },
  { name: "Templates", slug: "templates", group: "grow", icon: LiveStore },
  { name: "Settings", slug: "settings", group: "settings", icon: LiveSettings },
] as const;

/** The rail entry that stands for a section: itself, or its parent tab group. */
export function railSlugFor(slug: string): string {
  return DASHBOARD_NAV_ITEMS.find((item) => item.slug === slug)?.parent ?? slug;
}

/**
 * Build the href for a nav item within a given account + scope.
 * @param username account slug (no leading slash)
 * @param scope   `~` for all projects, or a project slug
 */
export function buildNavHref(
  username: string,
  scope: string,
  slug: string,
): string {
  if (slug === "") {
    // Overview: account root for `~`, project root otherwise.
    return scope === ALL_PROJECTS_SCOPE
      ? `/${username}`
      : `/${username}/${scope}`;
  }
  // The project list belongs to the workspace, whichever scope you're in.
  if (slug === "projects") return `/${username}/${ALL_PROJECTS_SCOPE}/projects`;
  const href = `/${username}/${scope}/${slug}`;
  if (slug === "emails" || slug === "observability") {
    return `${href}?view=overview`;
  }
  return href;
}
