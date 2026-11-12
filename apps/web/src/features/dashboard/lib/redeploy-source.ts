import type { DashboardDeployment } from "@/features/dashboard/components/DeploymentsPage";
import type { RedeployTarget } from "@/features/dashboard/components/deployments/RedeployDialog";

/** What the Redeploy dialog needs from a row in the deployments list. */
export function redeploySource(
  deployment: DashboardDeployment,
): RedeployTarget {
  return {
    projectId: deployment.projectId,
    deploymentId: deployment.id,
    branch: deployment.branch,
    target: deployment.target === "Production" ? "production" : "preview",
    // detailsUrl is …/deployments/<id>; new deployments open beside it.
    deploymentsHref: deployment.detailsUrl.replace(/\/[^/]+$/, ""),
  };
}
