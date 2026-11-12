import type { DashboardDeployment } from "@/features/dashboard/components/DeploymentsPage";
import type { WatchedBuild } from "@/features/dashboard/components/deployments/BuildWatcher";

/** The list's queued and building rows, in the shape the live watcher polls. */
export function watchedBuilds(
  deployments: readonly DashboardDeployment[],
): WatchedBuild[] {
  return deployments.flatMap((deployment) =>
    deployment.status === "Queued" || deployment.status === "Building"
      ? [
          {
            projectId: deployment.projectId,
            deploymentId: deployment.id,
            status: deployment.status === "Queued" ? "queued" : "building",
          },
        ]
      : [],
  );
}
