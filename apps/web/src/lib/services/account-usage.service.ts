import "server-only";
import { buildMeters, foldDaily } from "@/features/dashboard/lib/usage-period";
import type { AccountUsage } from "@/features/dashboard/types/usage.types";
import { METER_CATALOG } from "@/lib/payments/billing.catalog";
import { metricAllowance } from "@/lib/payments/billing-calculation";
import { prisma } from "@/lib/prisma";
import { accountEntitlements } from "@/lib/services/account-plan.service";
import { analyticsConfigured } from "@/lib/services/analytics-engine";
import { periodFallback } from "@/lib/services/billing-entitlement.helpers";
import { displayPlan } from "@/lib/services/billing-entitlement.service";
import { accountOwnerIdForSlug } from "@/lib/services/dashboard-scope.service";
import { projectAccessWhere } from "@/lib/services/project-access";
import {
  edgeDaily,
  recordedDaily,
  runtimeDaily,
} from "@/lib/services/usage-daily.service";
import { heldUsage } from "@/lib/services/usage-held.service";

const DAY_MS = 86_400_000;
const SERIES_DAYS = 31;

/**
 * The workspace's use this billing period, meter by meter, against what its
 * plan includes, plus the last month of edge traffic for the charts.
 */
export async function getAccountUsage(
  userId: string,
  workspaceUsername: string,
): Promise<AccountUsage> {
  const [ownerId, entitlements] = await Promise.all([
    accountOwnerIdForSlug(workspaceUsername),
    accountEntitlements(workspaceUsername),
  ]);
  const projects = await prisma.project.findMany({
    where: { ownerId: ownerId ?? "", OR: projectAccessWhere(userId) },
    select: { id: true },
  });
  const ids = projects.map((project) => project.id);
  const bounds = entitlements
    ? {
        start: entitlements.currentPeriodStart,
        end: entitlements.currentPeriodEnd,
      }
    : periodFallback(new Date());
  const period = {
    start: bounds.start.toISOString(),
    end: bounds.end.toISOString(),
  };
  const today = Math.floor(Date.now() / DAY_MS) * DAY_MS;
  const seriesStart = new Date(today - (SERIES_DAYS - 1) * DAY_MS);
  const allowances = entitlements
    ? Object.fromEntries(
        Object.keys(METER_CATALOG)
          .filter((key) => !METER_CATALOG[key]?.projectScoped)
          .map((key) => {
            const allowance = metricAllowance(entitlements.context, key);
            return [key, allowance === null ? null : Number(allowance)];
          }),
      )
    : {};
  const [recorded, held] = await Promise.all([
    recordedDaily(ids, bounds.start),
    heldUsage(ids),
  ]);
  const base = {
    plan: entitlements ? displayPlan(entitlements.context) : "hobby",
    period,
    measuredAt: new Date().toISOString(),
  } as const;
  const local = buildMeters({
    daily: foldDaily(recorded, period, Date.parse(base.measuredAt)),
    held,
    allowances,
  });
  const empty: AccountUsage = {
    ...base,
    averageLatency: 0,
    bandwidthBytes: 0,
    requests: 0,
    series: [],
    meters: local,
    metrics: usedOf(local),
    state: "ready",
  };
  if (!analyticsConfigured()) return { ...empty, state: "unconfigured" };
  if (!ids.length) return empty;
  try {
    const since = new Date(
      Math.min(bounds.start.getTime(), seriesStart.getTime()),
    );
    const [{ edge, events }, runtime] = await Promise.all([
      edgeDaily(ids, since),
      runtimeDaily(ids, bounds.start),
    ]);
    const inPeriod = edge.filter((day) => day.day >= period.start.slice(0, 10));
    const requests = inPeriod.reduce((sum, day) => sum + day.requests, 0);
    const bytes = inPeriod.reduce((sum, day) => sum + day.bytes, 0);
    const latency = inPeriod.reduce((sum, day) => sum + day.latencyTotal, 0);
    const meters = buildMeters({
      daily: foldDaily(
        [
          ...recorded,
          ...runtime,
          ...events,
          ...edge.flatMap((day) => [
            { metric: "edge_requests", day: day.day, quantity: day.requests },
            { metric: "fast_data_transfer", day: day.day, quantity: day.bytes },
          ]),
        ],
        period,
        Date.parse(base.measuredAt),
      ),
      held,
      allowances,
    });
    return {
      ...empty,
      averageLatency: requests ? Math.round(latency / requests) : 0,
      bandwidthBytes: bytes,
      requests,
      meters,
      metrics: usedOf(meters),
      series: edge
        .filter((day) => day.day >= seriesStart.toISOString().slice(0, 10))
        .sort((a, b) => a.day.localeCompare(b.day))
        .map((day) => ({
          day: day.day,
          requests: day.requests,
          bytes: day.bytes,
        })),
    };
  } catch (error) {
    console.error("[usage] edge figures failed:", error);
    return { ...empty, state: "error" };
  }
}

function usedOf(meters: AccountUsage["meters"]): Record<string, number> {
  return Object.fromEntries(
    Object.entries(meters).map(([key, meter]) => [key, meter.used]),
  );
}
