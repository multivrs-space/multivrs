"use client";

import { Suspense } from "react";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { DeploymentsBoard } from "@/features/dashboard/components/deployments/DeploymentsBoard";
import { PageBody } from "@/features/dashboard/components/PageBody";
import { DeploymentsTableSkeleton } from "@/features/dashboard/components/skeletons/DataSectionSkeletons";
import { useDashboardScope } from "@/features/dashboard/lib/useDashboardScope";
import type { DeploymentCreator } from "@/features/dashboard/types/deployment-creator.types";

export interface DashboardDeployment {
  id: string;
  projectId: string;
  project: string;
  projectSlug: string;
  status: "Ready" | "Queued" | "Building" | "Failed" | "Canceled";
  /** Where it was deployed to. */
  target: "Production" | "Preview";
  /** Same as `target`; kept for views that name it the environment. */
  environment: "Production" | "Preview";
  /** Serving the project's production address right now. */
  current: boolean;
  /** Its project builds from a repository, so it can be built again. */
  canRedeploy: boolean;
  branch: string;
  /** Short SHA; absent for uploads that didn't come from git. */
  commitSha?: string;
  commitUrl?: string;
  /** Only when the deploy recorded it; never made up from the SHA. */
  commitMessage?: string;
  renderMode?: string | null;
  /** "2m 05s" once finished; empty while queued or building. */
  duration: string;
  startedAt?: string;
  createdAt: string;
  /** Who started it; null for git pushes. */
  createdBy?: DeploymentCreator | null;
  detailsUrl: string;
  errorMessage?: string | null;
  url: string;
}

/** Build history and promotion status across this scope. */
export function DeploymentsPage({
  deployments,
}: {
  deployments: Promise<DashboardDeployment[] | null>;
}) {
  const { isAllProjects, scope, username } = useDashboardScope();
  return (
    <PageBody>
      <DashboardPageHeader
        description="Every build, where it went and what it shipped, newest first. Builds in progress stay pinned on top."
        eyebrow={isAllProjects ? `${username} · All projects` : scope}
        title="Deployments"
      />
      <Suspense fallback={<DeploymentsTableSkeleton />}>
        <DeploymentsBoard deployments={deployments} workspace={isAllProjects} />
      </Suspense>
    </PageBody>
  );
}
