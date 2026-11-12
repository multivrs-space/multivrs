import "server-only";
import { prisma } from "@/lib/prisma";
import {
  accountOwnerIdForSlug,
  canAccessDashboardWorkspace,
} from "@/lib/services/dashboard-scope.service";
import { projectAccessWhere } from "@/lib/services/project-access";

export type WarmTarget = { account: string } | { projectId: string };

/** The account whose machine a build will use; null when the viewer can't deploy there. */
async function buildOwner(userId: string, target: WarmTarget) {
  if ("projectId" in target) {
    const project = await prisma.project.findFirst({
      where: { id: target.projectId, OR: projectAccessWhere(userId) },
      select: { ownerId: true },
    });
    return project?.ownerId ?? null;
  }
  const ownerId = await accountOwnerIdForSlug(target.account);
  if (!ownerId) return null;
  if (ownerId === userId) return ownerId;
  return (await canAccessDashboardWorkspace(userId, target.account))
    ? ownerId
    : null;
}

/**
 * Start booting the account's build machine while the user is still on a
 * deploy screen, so the build lands on a running machine. Best effort: a
 * failure here only means the build boots its own machine, as before.
 */
export async function warmBuildMachine(userId: string, target: WarmTarget) {
  const url = process.env.CLOUDFLARE_BUILD_WORKER_URL;
  const token = process.env.CLOUDFLARE_BUILD_WORKER_TOKEN;
  if (!url || !token) return;
  const accountId = await buildOwner(userId, target);
  if (!accountId) return;
  await fetch(new URL("/warm", url), {
    body: JSON.stringify({ accountId }),
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    method: "POST",
    signal: AbortSignal.timeout(5_000),
  }).catch(() => undefined);
}
