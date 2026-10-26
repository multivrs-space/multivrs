import "server-only";
import { runtimeScriptName } from "@multivrs/client/runtime-worker";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/services/logger.service";

/** Newest ready deployments whose runtime Workers are kept (plus production). */
const KEEP_RECENT = 3;
/**
 * Deployments just past the keep window that get pruned on each release. Each
 * deployment crosses the window once, so a small fixed slice cleans up every
 * old Worker without tracking which ones were already deleted.
 */
const PRUNE_WINDOW = 5;
const CLOUDFLARE_API = "https://api.cloudflare.com/client/v4";

/**
 * Delete runtime Workers of superseded Next.js deployments. Without Workers for
 * Platforms every server-rendered deployment is its own Worker, and the account
 * allows 500, so old ones must go. Rolling back past the window needs a redeploy.
 */
export async function pruneRuntimeWorkers(projectId: string): Promise<void> {
  // Dedicated Workers Scripts:Edit token; CLOUDFLARE_API_TOKEN has other scopes.
  const token = process.env.CLOUDFLARE_WORKERS_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (!token || !accountId || process.env.CLOUDFLARE_DISPATCH_NAMESPACE) return;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { framework: true, productionDeploymentId: true },
  });
  if (project?.framework !== "nextjs") return;
  const recent = await prisma.deployment.findMany({
    where: { projectId, status: "ready" },
    orderBy: { createdAt: "desc" },
    take: KEEP_RECENT + PRUNE_WINDOW,
    select: { id: true },
  });
  const stale = recent
    .slice(KEEP_RECENT)
    .filter((deployment) => deployment.id !== project.productionDeploymentId);
  await Promise.all(
    stale.map(async (deployment) => {
      const script = runtimeScriptName(deployment.id);
      const response = await fetch(
        `${CLOUDFLARE_API}/accounts/${accountId}/workers/scripts/${script}?force=true`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
      );
      if (!response.ok && response.status !== 404) {
        logError(
          "runtime_worker.prune_failed",
          new Error(
            `Cloudflare returned ${response.status} deleting ${script}`,
          ),
        );
      }
    }),
  );
}
