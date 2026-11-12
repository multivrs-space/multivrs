import "server-only";
import { ConflictError } from "@multivrs/error-utils";
import { reconcileKey } from "@/lib/payments/reconcile-window";
import { prisma } from "@/lib/prisma";
import { resolveBillingEntitlements } from "@/lib/services/billing-entitlement.service";
import { recordUsageEvent } from "@/lib/services/usage-event.service";

/** One project's metric for one hour, ready to meter. */
export type UsageRow = {
  metric: string;
  projectId: string;
  quantity: number;
  periodEnd: Date;
};

/**
 * Meter each row unless its hour was already metered. A plan limit hit
 * blocks the project until the period ends, as live metering does.
 */
export async function reconcileEntries(entries: UsageRow[]) {
  const result = { blocked: 0, recorded: 0, skipped: 0 };
  const keys = entries.map((entry) =>
    reconcileKey(entry.projectId, entry.metric, entry.periodEnd),
  );
  const done = new Set(
    (
      await prisma.usageEvent.findMany({
        where: { idempotencyKey: { in: keys } },
        select: { idempotencyKey: true },
      })
    ).map((event) => event.idempotencyKey),
  );
  const owners = new Map<string, string | null>();
  for (const [index, entry] of entries.entries()) {
    const key = keys[index] ?? "";
    if (done.has(key)) {
      result.skipped += 1;
      continue;
    }
    if (!owners.has(entry.projectId)) {
      const project = await prisma.project.findUnique({
        where: { id: entry.projectId },
        select: { ownerId: true },
      });
      owners.set(entry.projectId, project?.ownerId ?? null);
    }
    const ownerId = owners.get(entry.projectId);
    if (!ownerId) continue;
    try {
      await recordUsageEvent(
        ownerId,
        entry.projectId,
        entry.metric,
        entry.quantity,
        {
          periodEnd: entry.periodEnd.toISOString(),
          source: "cloudflare-analytics",
        },
        { idempotencyKey: key },
      );
      result.recorded += 1;
    } catch (error) {
      if (!(error instanceof ConflictError)) throw error;
      const entitlements = await resolveBillingEntitlements(
        ownerId,
        entry.projectId,
      );
      await prisma.project.update({
        where: { id: entry.projectId },
        data: {
          usageBlockReason: error.message,
          usageBlockedUntil: entitlements.currentPeriodEnd,
        },
      });
      result.blocked += 1;
    }
  }
  return result;
}
