import type { DashboardDeployment } from "@/features/dashboard/components/DeploymentsPage";
import { LAB_METERS } from "@/features/dashboard/lab/lab-usage-data";
import type {
  DeployStats,
  TrafficHeat,
} from "@/features/dashboard/types/overview.types";
import type { DashboardProject } from "@/features/dashboard/types/project.types";
import type { AccountUsage } from "@/features/dashboard/types/usage.types";

/* Synthetic workspace for tuning the overview in the lab only. Product pages
   never render made-up numbers. */

const DAY_MS = 86_400_000;
const today = Math.floor(Date.UTC(2026, 9, 27) / DAY_MS) * DAY_MS;

export const LAB_USAGE: AccountUsage = {
  averageLatency: 84,
  bandwidthBytes: LAB_METERS.fast_data_transfer?.used ?? 0,
  requests: LAB_METERS.edge_requests?.used ?? 0,
  meters: LAB_METERS,
  metrics: Object.fromEntries(
    Object.entries(LAB_METERS).map(([key, meter]) => [key, meter.used]),
  ),
  period: {
    start: "2026-10-01T00:00:00.000Z",
    end: "2026-11-01T00:00:00.000Z",
  },
  plan: "pro",
  measuredAt: "2026-10-27T15:00:00.000Z",
  state: "ready",
  series: Array.from({ length: 31 }, (_, index) => {
    const requests = Math.round(
      42_000 + 21_000 * Math.sin(index / 2) + index * 1_900,
    );
    return {
      day: new Date(today - (30 - index) * DAY_MS).toISOString().slice(0, 10),
      requests,
      bytes: requests * 31_000,
    };
  }),
};

export const LAB_DEPLOYS: DeployStats = {
  thisWeek: 38,
  lastWeek: 29,
  ready: 112,
  failed: 7,
  building: 2,
};

export const LAB_HEAT: TrafficHeat = (() => {
  const cells = Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, hour) => {
      const workday = day < 5 ? 1 : 0.45;
      const curve =
        Math.max(0, Math.sin(((hour - 5) / 24) * Math.PI * 2)) +
        (hour >= 18 && hour <= 22 ? 0.4 : 0);
      return Math.round(4_000 * workday * curve);
    }),
  );
  return { cells, total: cells.flat().reduce((sum, value) => sum + value, 0) };
})();

const project = (
  slug: string,
  name: string,
  status: DashboardProject["status"],
): DashboardProject => ({
  id: slug,
  slug,
  name,
  siteUrl: `https://${slug}.multivrs.app`,
  siteLabel: `${slug}.multivrs.app`,
  faviconUrl: null,
  repositoryUrl: null,
  repositoryLabel: null,
  status,
  latestDeployment: null,
});

export const LAB_PROJECTS: DashboardProject[] = [
  project("storefront", "Storefront", "ready"),
  project("api", "API", "ready"),
  project("docs", "Docs", "building"),
  project("admin", "Admin", "ready"),
];

export const LAB_DOMAINS = [
  { status: "Active" },
  { status: "Active" },
  { status: "Pending" },
];

const deploy = (
  id: string,
  name: string,
  status: DashboardDeployment["status"],
  hours: number,
  target: DashboardDeployment["target"],
  current = false,
): DashboardDeployment => ({
  id: `${id}-5d1e-4b7a-9c0f-2e6d4a1b7c33`,
  project: name,
  projectId: name,
  projectSlug: name.toLowerCase(),
  status,
  target,
  environment: target,
  current,
  canRedeploy: true,
  branch: target === "Production" ? "main" : "feat/checkout",
  commitSha: id.slice(0, 7),
  commitUrl: `https://github.com/acme/storefront/commit/${id}`,
  renderMode: name === "API" ? "ssr" : null,
  createdAt: new Date(
    Date.UTC(2026, 9, 27, 12) - hours * 3_600_000,
  ).toISOString(),
  startedAt: new Date(
    Date.UTC(2026, 9, 27, 12) - hours * 3_600_000,
  ).toISOString(),
  detailsUrl: "#",
  duration: status === "Building" || status === "Queued" ? "" : "1m 04s",
  errorMessage:
    status === "Failed" ? "Build failed: Cannot find module './theme'" : null,
  url: `https://${name.toLowerCase()}-${id}.multivrs.app`,
});

export const LAB_DEPLOYMENTS: DashboardDeployment[] = [
  deploy("a81f3c2e", "Storefront", "Building", 0.1, "Preview"),
  deploy("9be1d77a", "API", "Ready", 2, "Production", true),
  deploy("44c0aa19", "Docs", "Failed", 5, "Preview"),
  deploy("51e0b2c4", "Docs", "Canceled", 6, "Preview"),
  deploy("7d2e9f01", "Storefront", "Ready", 26, "Production", true),
  deploy("c3a5b6d8", "Admin", "Ready", 49, "Production", true),
  deploy("0f9e8d7c", "Admin", "Ready", 73, "Production"),
];
