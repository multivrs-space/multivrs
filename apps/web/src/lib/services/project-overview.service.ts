import "server-only";
import { NotFoundError } from "@multivrs/error-utils";
import type {
  ProjectOverviewData,
  ProjectOverviewDeployment,
} from "@/features/dashboard/types/project-overview.types";
import { prisma } from "@/lib/prisma";
import { getProjectAnalytics } from "@/lib/services/analytics.service";
import { accountOwnerIdForSlug } from "@/lib/services/dashboard-scope.service";
import { CREATOR_INCLUDE, toCreator } from "@/lib/services/deployment-creator";
import { projectAccessWhere } from "@/lib/services/project-access";
import { projectFavicon } from "@/lib/services/project-favicon";
import { projectUrl } from "@/lib/services/serve.service";

function deployment(row: {
  branch: string | null;
  commitSha: string | null;
  createdAt: Date;
  errorMessage: string | null;
  finishedAt: Date | null;
  id: string;
  startedAt: Date | null;
  status: string;
  target: string;
  url: string | null;
  createdBy: Parameters<typeof toCreator>[0];
}): ProjectOverviewDeployment {
  return {
    branch: row.branch ?? "main",
    commitSha: row.commitSha,
    createdAt: row.createdAt.toISOString(),
    errorMessage: row.errorMessage,
    finishedAt: row.finishedAt?.toISOString() ?? null,
    id: row.id,
    startedAt: row.startedAt?.toISOString() ?? null,
    status: row.status,
    target: row.target === "production" ? "production" : "preview",
    url: row.url,
    createdBy: toCreator(row.createdBy),
  };
}

export async function getProjectOverview(
  userId: string,
  username: string,
  slug: string,
): Promise<ProjectOverviewData> {
  // Same lookup as the project list: the URL names a workspace (a user or a
  // team), resolved to its account owner, and the viewer needs project access.
  const ownerId = await accountOwnerIdForSlug(username);
  if (!ownerId) throw new NotFoundError("Project not found");
  const project = await prisma.project.findFirst({
    include: {
      // Enough history to show each active branch's latest build.
      deployments: {
        orderBy: { createdAt: "desc" },
        take: 30,
        include: { createdBy: CREATOR_INCLUDE },
      },
      domains: { orderBy: { createdAt: "asc" } },
      productionDeployment: { include: { createdBy: CREATOR_INCLUDE } },
    },
    where: { ownerId, slug, OR: projectAccessWhere(userId) },
  });
  if (!project) throw new NotFoundError("Project not found");
  const hostname =
    project.domains.find((domain) => domain.verified)?.hostname ?? null;
  return {
    address: projectUrl(project.slug),
    analytics: await getProjectAnalytics(project.id),
    createdAt: project.createdAt.toISOString(),
    domains: project.domains.map((domain) => ({
      hostname: domain.hostname,
      status:
        domain.verified && domain.certStatus === "active"
          ? "Active"
          : "Pending",
    })),
    faviconUrl: projectFavicon({
      slug: project.slug,
      productionDeploymentId: project.productionDeploymentId,
      hostname,
    }),
    framework: project.framework,
    id: project.id,
    name: project.name,
    production: project.productionDeployment
      ? deployment(project.productionDeployment)
      : null,
    recentDeployments: project.deployments.map(deployment),
    repositoryUrl: project.repositoryUrl,
    slug: project.slug,
  };
}
