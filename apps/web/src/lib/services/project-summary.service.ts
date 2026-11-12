import "server-only";
import type { ProjectNavSummary } from "@/features/dashboard/types/project-summary.types";
import { prisma } from "@/lib/prisma";
import { accountOwnerIdForSlug } from "@/lib/services/dashboard-scope.service";
import { projectAccessWhere } from "@/lib/services/project-access";
import { projectFavicon } from "@/lib/services/project-favicon";
import { projectUrl } from "@/lib/services/serve.service";

function status(value: string | undefined): ProjectNavSummary["status"] {
  if (!value) return "idle";
  if (value === "queued" || value === "building") return "building";
  if (value === "error" || value === "canceled") return "error";
  return "ready";
}

/** One project's sidebar header and counts; null when the viewer can't see it. */
export async function projectNavSummary(
  userId: string,
  account: string,
  slug: string,
): Promise<ProjectNavSummary | null> {
  const ownerId = await accountOwnerIdForSlug(account);
  if (!ownerId) return null;
  const project = await prisma.project.findFirst({
    where: { ownerId, slug, OR: projectAccessWhere(userId) },
    select: {
      name: true,
      slug: true,
      productionDeploymentId: true,
      deployments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { status: true },
      },
      domains: {
        where: { verified: true },
        take: 1,
        select: { hostname: true },
      },
      _count: {
        select: {
          domains: true,
          environmentVariables: true,
          firewallRules: true,
          platformSandboxes: true,
          workflows: true,
        },
      },
    },
  });
  if (!project) return null;
  const hostname = project.domains[0]?.hostname ?? null;
  const address = projectUrl(project.slug);
  return {
    name: project.name,
    slug: project.slug,
    faviconUrl: projectFavicon({
      slug: project.slug,
      productionDeploymentId: project.productionDeploymentId,
      hostname,
    }),
    siteLabel: project.productionDeploymentId
      ? (hostname ?? address?.replace(/^https?:\/\//, "") ?? null)
      : null,
    status: status(project.deployments[0]?.status),
    counts: {
      domains: project._count.domains,
      "environment-variables": project._count.environmentVariables,
      firewall: project._count.firewallRules,
      sandboxes: project._count.platformSandboxes,
      workflows: project._count.workflows,
    },
  };
}
