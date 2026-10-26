import "server-only";
import { NotFoundError } from "@multivrs/error-utils";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { projectAccessWhere } from "@/lib/services/project-access";

export interface ScopedProject {
  id: string;
  name: string;
  slug: string;
}

/**
 * The account behind a dashboard URL segment. That segment is the user's
 * username, or — when the account has a team — the team's slug, which is
 * what `/dashboard` redirects to.
 */
export const accountOwnerIdForSlug = cache(async function accountOwnerIdForSlug(
  slug: string,
): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { username: slug },
    select: { id: true },
  });
  if (user) return user.id;
  const team = await prisma.organization.findUnique({
    where: { slug },
    select: { accountOwnerId: true },
  });
  return team?.accountOwnerId ?? null;
});

/** Another account's dashboard: open to its team, and to members of its workspaces' projects. */
export const canAccessDashboardWorkspace = cache(
  async function canAccessDashboardWorkspace(
    userId: string,
    username: string,
  ): Promise<boolean> {
    const [teamMember, orgMember, project] = await Promise.all([
      prisma.member.findFirst({
        where: { userId, organization: { accountOwner: { username } } },
        select: { id: true },
      }),
      prisma.member.findFirst({
        where: { userId, organization: { slug: username } },
        select: { id: true },
      }),
      prisma.project.findFirst({
        where: {
          OR: [{ owner: { username } }, { organization: { slug: username } }],
          organization: { members: { some: { userId } } },
        },
        select: { id: true },
      }),
    ]);
    return Boolean(teamMember ?? orgMember ?? project);
  },
);

export async function getScopedProject(
  userId: string,
  username: string,
  slug: string,
): Promise<ScopedProject> {
  const ownerId = await accountOwnerIdForSlug(username);
  if (!ownerId) throw new NotFoundError("Project not found");
  const project = await prisma.project.findFirst({
    where: {
      ownerId,
      slug,
      OR: projectAccessWhere(userId),
    },
    select: { id: true, name: true, slug: true },
  });
  if (!project) throw new NotFoundError("Project not found");
  return project;
}
