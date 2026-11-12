import "server-only";
import type { DashboardDeployment } from "@/features/dashboard/components/DeploymentsPage";
import { prisma } from "@/lib/prisma";
import { accountOwnerIdForSlug } from "@/lib/services/dashboard-scope.service";
import { CREATOR_INCLUDE, toCreator } from "@/lib/services/deployment-creator";
import { projectAccessWhere } from "@/lib/services/project-access";

const STATUS: Record<string, DashboardDeployment["status"]> = {
  ready: "Ready",
  queued: "Queued",
  building: "Building",
  error: "Failed",
  canceled: "Canceled",
};

/** "43s" or "2m 05s" from start to finish; empty while still running. */
function duration(start: Date, end: Date | null): string {
  if (!end) return "";
  const seconds = Math.max(
    0,
    Math.round((end.getTime() - start.getTime()) / 1000),
  );
  return seconds >= 60
    ? `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, "0")}s`
    : `${seconds}s`;
}

/** A commit page on the host the repository lives on, when it's GitHub. */
function commitUrl(repositoryUrl: string | null, sha: string | null) {
  if (!repositoryUrl || !sha) return undefined;
  const base = repositoryUrl.replace(/\.git$/, "").replace(/\/$/, "");
  return /^https:\/\/github\.com\/[^/]+\/[^/]+$/.test(base)
    ? `${base}/commit/${sha}`
    : undefined;
}

/** The latest 50 deployments in scope, newest first, with what each shipped. */
export async function dashboardDeployments(
  viewerId: string,
  username: string,
  projectSlug?: string,
): Promise<DashboardDeployment[] | null> {
  const ownerId = await accountOwnerIdForSlug(username);
  if (!ownerId) return null;
  const rows = await prisma.deployment.findMany({
    where: {
      project: {
        ownerId,
        ...(projectSlug ? { slug: projectSlug } : {}),
        OR: projectAccessWhere(viewerId),
      },
    },
    include: { project: true, createdBy: CREATOR_INCLUDE },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return rows.map((deployment) => {
    const status = STATUS[deployment.status] ?? "Failed";
    const target =
      deployment.target === "production" ? "Production" : "Preview";
    const finished =
      status === "Ready" || status === "Failed" || status === "Canceled";
    return {
      id: deployment.id,
      projectId: deployment.projectId,
      project: deployment.project.name,
      projectSlug: deployment.project.slug,
      status,
      target,
      environment: target,
      current: deployment.project.productionDeploymentId === deployment.id,
      canRedeploy: Boolean(deployment.project.repositoryUrl),
      branch: deployment.branch ?? "main",
      commitSha: deployment.commitSha?.slice(0, 7),
      commitUrl: commitUrl(
        deployment.project.repositoryUrl,
        deployment.commitSha,
      ),
      renderMode: deployment.renderMode,
      duration: finished
        ? duration(
            deployment.startedAt ?? deployment.createdAt,
            deployment.finishedAt ?? deployment.updatedAt,
          )
        : "",
      startedAt: deployment.startedAt?.toISOString(),
      url: deployment.url ?? "",
      createdAt: deployment.createdAt.toISOString(),
      createdBy: toCreator(deployment.createdBy),
      detailsUrl: `/${username}/${projectSlug ?? "~"}/deployments/${deployment.id}`,
      errorMessage: deployment.errorMessage,
    };
  });
}
