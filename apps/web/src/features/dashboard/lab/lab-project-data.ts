import { LAB_ANALYTICS } from "@/features/dashboard/lab/lab-analytics-data";
import type {
  ProjectOverviewData,
  ProjectOverviewDeployment,
} from "@/features/dashboard/types/project-overview.types";

/* Sample data for the design lab only. */

const build = (
  id: string,
  branch: string,
  status: string,
  minutesAgo: number,
  seconds: number,
  target: "production" | "preview" = "preview",
): ProjectOverviewDeployment => {
  const created = Date.parse("2026-10-28T12:00:00Z") - minutesAgo * 60_000;
  return {
    branch,
    commitSha: `${id}9f2c1d0e4b7a8c6d5e3f1a2b3c4d5e6f7a8b9c`.slice(0, 40),
    createdAt: new Date(created).toISOString(),
    errorMessage:
      status === "error"
        ? "Building with Next.js failed: Type error in app/page.tsx"
        : null,
    finishedAt: new Date(created + (seconds + 4) * 1_000).toISOString(),
    id: `${id}-lab-deployment`,
    startedAt: new Date(created + 4_000).toISOString(),
    status,
    target,
    url: status === "ready" ? `https://${id}-lab.multivrs.app` : null,
    createdBy: branch === "main" ? null : { name: "cole", avatarUrl: null },
  };
};

const deployments = [
  build("a1b2c3d", "main", "ready", 21, 7, "production"),
  build("b2c3d4e", "feat/checkout", "ready", 95, 9),
  build("c3d4e5f", "main", "error", 140, 5, "production"),
  build("d4e5f6a", "fix/header", "ready", 300, 6),
  build("e5f6a7b", "main", "ready", 1_500, 8, "production"),
];

export const LAB_PROJECT_OVERVIEW: ProjectOverviewData = {
  address: "https://storefront.multivrs.app",
  analytics: LAB_ANALYTICS,
  createdAt: "2026-10-01T09:00:00Z",
  domains: [
    { hostname: "shop.acme.com", status: "Active" },
    { hostname: "acme.store", status: "Pending" },
  ],
  faviconUrl: null,
  framework: "nextjs",
  id: "lab-project",
  name: "storefront",
  production: deployments[0] ?? null,
  recentDeployments: deployments,
  repositoryUrl: "https://github.com/acme/storefront",
  slug: "storefront",
};
