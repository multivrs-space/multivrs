import "server-only";
import { cache } from "react";
import type {
  DashboardProject,
  ProjectStatus,
} from "@/features/dashboard/types/project.types";
import { prisma } from "@/lib/prisma";
import { accountOwnerIdForSlug } from "@/lib/services/dashboard-scope.service";
import { projectAccessWhere } from "@/lib/services/project-access";
import { faviconUrl, projectFavicon } from "@/lib/services/project-favicon";
import { deploymentUrl, projectUrl } from "@/lib/services/serve.service";

function relative(date: Date): string {
  const minutes = Math.max(
    1,
    Math.floor((Date.now() - date.getTime()) / 60_000),
  );
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;
}

function status(value?: string): ProjectStatus {
  if (!value) return "idle";
  if (value === "queued" || value === "building") return "building";
  if (value === "error" || value === "canceled") return "error";
  return "ready";
}

export const dashboardProjectOptions = cache(
  async function dashboardProjectOptions(
    username: string,
    viewerId: string,
  ): Promise<{ slug: string; name: string; faviconUrl: string | null }[]> {
    // The URL segment is a username or a team slug; both resolve to an owner.
    const ownerId = await accountOwnerIdForSlug(username);
    if (!ownerId) return [];
    const projects = await prisma.project.findMany({
      where: {
        ownerId,
        OR: projectAccessWhere(viewerId),
      },
      select: {
        slug: true,
        name: true,
        productionDeploymentId: true,
        domains: {
          where: { verified: true },
          take: 1,
          select: { hostname: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    return projects.map((project) => ({
      slug: project.slug,
      name: project.name,
      faviconUrl: projectFavicon({
        slug: project.slug,
        productionDeploymentId: project.productionDeploymentId,
        hostname: project.domains[0]?.hostname ?? null,
      }),
    }));
  },
);

export const dashboardProjects = cache(async function dashboardProjects(
  username: string,
  viewerId: string,
): Promise<DashboardProject[] | null> {
  const ownerId = await accountOwnerIdForSlug(username);
  if (!ownerId) return null;
  const projects = await prisma.project.findMany({
    where: {
      ownerId,
      OR: projectAccessWhere(viewerId),
    },
    include: {
      deployments: { orderBy: { createdAt: "desc" }, take: 1 },
      domains: { where: { verified: true }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });
  return projects.map((project) => {
    const latest = project.deployments[0];
    const hostname = project.domains[0]?.hostname ?? null;
    const generatedDeploymentUrl = latest
      ? (latest.url ?? deploymentUrl(latest.id))
      : null;
    // Custom domain first, then the project's own address; a per-deployment
    // URL only when no deployment domain is configured (local development).
    const siteUrl = hostname
      ? `https://${hostname}`
      : (projectUrl(project.slug) ?? generatedDeploymentUrl);
    const repositoryLabel = project.repositoryUrl
      ? new URL(project.repositoryUrl).pathname
          .replace(/^\//, "")
          .replace(/\.git$/, "")
      : null;
    return {
      id: project.id,
      slug: project.slug,
      name: project.name,
      siteUrl,
      siteLabel: hostname ?? hostLabel(siteUrl),
      // Only a live site has a logo to fetch; asking one that never went
      // live leaves the image hanging.
      faviconUrl:
        project.productionDeploymentId && siteUrl ? faviconUrl(siteUrl) : null,
      repositoryUrl: project.repositoryUrl,
      repositoryLabel,
      status: status(latest?.status),
      latestDeployment: latest
        ? {
            id: latest.id,
            label: latest.commitSha
              ? `Commit ${latest.commitSha.slice(0, 7)}`
              : `Deployment ${latest.id.slice(0, 8)}`,
            branch: latest.branch ?? "main",
            createdAt: relative(latest.createdAt),
            rawStatus: latest.status,
          }
        : null,
    };
  });
});

function hostLabel(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("/")) return "Deployment preview";
  try {
    return new URL(url).host || null;
  } catch {
    return null;
  }
}
