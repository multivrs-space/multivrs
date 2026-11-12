import type { PlatformAnalytics } from "@/features/dashboard/types/analytics.types";
import type { DeploymentCreator } from "@/features/dashboard/types/deployment-creator.types";

export interface ProjectOverviewDeployment {
  branch: string;
  commitSha: string | null;
  createdAt: string;
  errorMessage: string | null;
  /** When the build ran, for its duration; null until it starts or ends. */
  finishedAt: string | null;
  id: string;
  startedAt: string | null;
  status: string;
  target: "production" | "preview";
  url: string | null;
  /** Null for git pushes; the commit then names its author. */
  createdBy: DeploymentCreator | null;
}

export interface ProjectOverviewData {
  /** The project's own address (`https://<slug>.<deployment domain>`), if configured. */
  address: string | null;
  analytics: PlatformAnalytics;
  createdAt: string;
  domains: Array<{ hostname: string; status: string }>;
  /** The live site's own icon; null until production is up. */
  faviconUrl: string | null;
  framework: string | null;
  id: string;
  name: string;
  production: ProjectOverviewDeployment | null;
  recentDeployments: ProjectOverviewDeployment[];
  /** `https://github.com/owner/repo` when connected. */
  repositoryUrl: string | null;
  slug: string;
}
