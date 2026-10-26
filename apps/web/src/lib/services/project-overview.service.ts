import "server-only";
import { NotFoundError } from "@multivrs/error-utils";
import type {
  ProjectOverviewData,
  ProjectOverviewDeployment,
} from "@/features/dashboard/types/project-overview.types";
import { prisma } from "@/lib/prisma";
import { getProjectAnalytics } from "@/lib/services/analytics.service";
import { accountOwnerIdForSlug } from "@/lib/services/dashboard-scope.service";
import { projectAccessWhere } from "@/lib/services/project-access";
import { projectUrl } from "@/lib/services/serve.service";

function deployment(row: {
  branch: string | null;
  commitSha: string | null;
  createdAt: Date;
  errorMessage: string | null;
  id: string;
  status: string;
  url: string | null;
}): ProjectOverviewDeployment {
  return {
    branch: row.branch ?? "main",
    commitSha: row.commitSha,
    createdAt: row.createdAt.toISOString(),
    errorMessage: row.errorMessage,
    id: row.id,
    status: row.status,
    url: row.url,
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
      deployments: { orderBy: { createdAt: "desc" }, take: 6 },
      domains: { orderBy: { createdAt: "asc" } },
      productionDeployment: true,
    },
    where: { ownerId, slug, OR: projectAccessWhere(userId) },
  });
  if (!project) throw new NotFoundError("Project not found");
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
    framework: project.framework,
    id: project.id,
    name: project.name,
    production: project.productionDeployment
      ? deployment(project.productionDeployment)
      : null,
    recentDeployments: project.deployments.map(deployment),
    slug: project.slug,
  };
}
