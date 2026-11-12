import "server-only";
import { notFound } from "next/navigation";
import { ALL_PROJECTS_SCOPE } from "@/features/dashboard/constants/navigation";
import type { DashboardProject } from "@/features/dashboard/types/project.types";
import { getServerSession } from "@/lib/auth/session";
import { dashboardProjects } from "@/lib/services/dashboard.service";

export interface ObserveScope {
  viewerId: string;
  /** Every project in scope: the one at /[project], all of them at `~`. */
  projects: DashboardProject[];
  ids: string[];
  workspace: boolean;
  /** The project's name, or the workspace slug at `~`. */
  scopeName: string;
  /** `/[username]/[scope]` */
  baseHref: string;
  /** Project id → its name and dashboard root, for rows across projects. */
  links: [string, { name: string; href: string }][];
}

/** Who's looking and which projects an Observe page reads, or a 404. */
export async function observeScope(
  username: string,
  scope: string,
): Promise<ObserveScope> {
  const session = await getServerSession();
  if (!session) notFound();
  const all = await dashboardProjects(username, session.user.id);
  if (!all) notFound();
  const workspace = scope === ALL_PROJECTS_SCOPE;
  const projects = workspace
    ? all
    : all.filter((project) => project.slug === scope);
  if (!projects.length && !workspace) notFound();
  return {
    viewerId: session.user.id,
    projects,
    ids: projects.map((project) => project.id),
    workspace,
    scopeName: workspace ? username : (projects[0]?.name ?? scope),
    baseHref: `/${username}/${scope}`,
    links: projects.map((project) => [
      project.id,
      { name: project.name, href: `/${username}/${project.slug}` },
    ]),
  };
}
