import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Amounts held right now rather than used over time: storage kept, rules
 * and mounts enabled, sandboxes running.
 */
export async function heldUsage(
  projectIds: string[],
): Promise<Record<string, number>> {
  const scope = { projectId: { in: projectIds } };
  const [blob, redirects, entries, mounts, sandboxes, workflows] =
    await Promise.all([
      prisma.projectBlob.aggregate({
        where: { ...scope, status: "ready" },
        _sum: { size: true },
      }),
      prisma.bulkRedirect.count({ where: { ...scope, enabled: true } }),
      prisma.edgeConfigEntry.count({ where: scope }),
      prisma.microfrontendRoute.count({ where: { ...scope, enabled: true } }),
      prisma.platformSandbox.count({
        where: { ...scope, status: { in: ["creating", "running"] } },
      }),
      prisma.platformWorkflowRun.aggregate({
        where: scope,
        _sum: { outputBytes: true, payloadBytes: true },
      }),
    ]);
  return {
    blob_storage_size: Number(blob._sum.size ?? 0),
    bulk_redirects: redirects,
    edge_config_entries: entries,
    microfrontend_mounts: mounts,
    concurrent_sandboxes: sandboxes,
    workflow_data_retained_bytes:
      Number(workflows._sum.payloadBytes ?? 0) +
      Number(workflows._sum.outputBytes ?? 0),
  };
}
