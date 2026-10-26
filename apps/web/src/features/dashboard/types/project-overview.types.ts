import type { PlatformAnalytics } from "@/features/dashboard/types/analytics.types";

export interface ProjectOverviewDeployment {
  branch: string;
  commitSha: string | null;
  createdAt: string;
  errorMessage: string | null;
  id: string;
  status: string;
  url: string | null;
}

export interface ProjectOverviewData {
  /** The project's own address (`https://<slug>.<deployment domain>`), if configured. */
  address: string | null;
  analytics: PlatformAnalytics;
  createdAt: string;
  domains: Array<{ hostname: string; status: string }>;
  framework: string | null;
  id: string;
  name: string;
  production: ProjectOverviewDeployment | null;
  recentDeployments: ProjectOverviewDeployment[];
  slug: string;
}
