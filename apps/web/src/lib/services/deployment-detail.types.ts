import type { DeploymentCreator } from "@/features/dashboard/types/deployment-creator.types";

export interface DashboardDeploymentLog {
  id: string;
  level: string;
  message: string;
  createdAt: string;
}

export interface DashboardDeploymentDetail {
  id: string;
  projectId: string;
  project: string;
  /** Whether the project builds from a repository, i.e. can be redeployed. */
  hasRepository: boolean;
  target: "production" | "preview";
  status: string;
  url: string | null;
  branch: string;
  commitSha: string | null;
  errorMessage: string | null;
  createdAt: string;
  /** Null for git pushes; the commit then names its author. */
  createdBy: DeploymentCreator | null;
  logs: DashboardDeploymentLog[];
}
