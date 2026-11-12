import "server-only";
import { prisma } from "@/lib/prisma";
import { accountOwnerIdForSlug } from "@/lib/services/dashboard-scope.service";
import { CREATOR_INCLUDE, toCreator } from "@/lib/services/deployment-creator";
import type {
  DashboardDeploymentDetail,
  DashboardDeploymentLog,
} from "@/lib/services/deployment-detail.types";
import { projectAccessWhere } from "@/lib/services/project-access";

type DeploymentLogRow = Omit<DashboardDeploymentLog, "createdAt"> & {
  createdAt: Date;
};

/**
 * One deployment with its build log, if the viewer can see its project. The
 * URL segment may be a username or a team slug.
 */
export async function dashboardDeploymentDetail(
  viewerId: string,
  username: string,
  scope: string,
  deploymentId: string,
): Promise<DashboardDeploymentDetail | null> {
  const ownerId = await accountOwnerIdForSlug(username);
  if (!ownerId) return null;
  const deployment = await prisma.deployment.findFirst({
    where: {
      id: deploymentId,
      project: {
        ownerId,
        OR: projectAccessWhere(viewerId),
        ...(scope === "~" ? {} : { slug: scope }),
      },
    },
    include: {
      project: true,
      createdBy: CREATOR_INCLUDE,
      logs: { orderBy: { createdAt: "asc" }, take: 1_000 },
    },
  });
  if (!deployment) return null;
  return {
    id: deployment.id,
    projectId: deployment.projectId,
    project: deployment.project.name,
    hasRepository: Boolean(deployment.project.repositoryUrl),
    target: deployment.target === "production" ? "production" : "preview",
    status: deployment.status,
    url: deployment.url,
    branch: deployment.branch ?? "main",
    commitSha: deployment.commitSha,
    errorMessage: deployment.errorMessage,
    createdAt: deployment.createdAt.toISOString(),
    createdBy: toCreator(deployment.createdBy),
    logs: deployment.logs.map((log: DeploymentLogRow) => ({
      id: log.id,
      level: log.level,
      message: log.message,
      createdAt: log.createdAt.toISOString(),
    })),
  };
}
