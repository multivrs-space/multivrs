import "server-only";
import type { DailyAmount } from "@/features/dashboard/lib/usage-period";
import { prisma } from "@/lib/prisma";
import {
  DATASET,
  number,
  queryAnalytics,
  sqlProjectId,
} from "@/lib/services/analytics-engine";

/** Request rows carry `request`, or the HTTP method on older writes. */
const REQUEST_KINDS = new Set([
  "request",
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
]);

/** One UTC day of edge requests, with bytes served and summed latency. */
export interface EdgeDay {
  day: string;
  requests: number;
  bytes: number;
  latencyTotal: number;
}

const DAY_MS = 86_400_000;

/**
 * A window reaching back to `since`, written the way Analytics Engine reads
 * reliably (relative to NOW, in whole days). It may start up to a day
 * early; callers fold rows by day and drop what falls before the period.
 */
function sinceFilter(since: Date): string {
  const days = Math.max(
    1,
    Math.ceil((Date.now() - since.getTime()) / DAY_MS) + 1,
  );
  return `timestamp >= NOW() - INTERVAL '${days}' DAY`;
}

function idList(projectIds: string[]): string {
  return projectIds.map((id) => `'${sqlProjectId(id)}'`).join(",");
}

/**
 * Use the platform recorded itself: builds, sandboxes, workflows, mail. The
 * hourly copies of edge counts are left out, since the edge rows count them.
 */
export async function recordedDaily(
  projectIds: string[],
  since: Date,
): Promise<DailyAmount[]> {
  if (!projectIds.length) return [];
  const rows = await prisma.$queryRaw<
    { metric: string; day: Date; quantity: number }[]
  >`
    SELECT metric, date_trunc('day', "occurredAt") AS day, SUM(quantity)::float8 AS quantity
    FROM usage_events
    WHERE "projectId" = ANY(${projectIds}::text[]) AND "occurredAt" >= ${since}
      AND (metadata->>'source') IS DISTINCT FROM 'cloudflare-analytics'
    GROUP BY 1, 2`;
  return rows.map((row) => ({
    metric: row.metric,
    day: row.day.toISOString().slice(0, 10),
    quantity: row.quantity,
  }));
}

/** Runtime meters the edge writes as it serves: functions, images, blob… */
export async function runtimeDaily(
  projectIds: string[],
  since: Date,
): Promise<DailyAmount[]> {
  if (!projectIds.length) return [];
  const rows = await queryAnalytics(
    `SELECT toDate(timestamp) day, blob1 metric, SUM(double1 * _sample_interval) quantity FROM multivrs_usage WHERE index1 IN (${idList(projectIds)}) AND ${sinceFilter(since)} GROUP BY day, metric`,
  );
  return rows.map((row) => ({
    metric: String(row.metric ?? ""),
    day: String(row.day ?? "").slice(0, 10),
    quantity: number(row, "quantity"),
  }));
}

/**
 * Edge traffic per day, plus the page-view and web-vital events that bill
 * as Web Analytics and Speed Insights.
 */
export async function edgeDaily(
  projectIds: string[],
  since: Date,
): Promise<{ edge: EdgeDay[]; events: DailyAmount[] }> {
  if (!projectIds.length) return { edge: [], events: [] };
  const rows = await queryAnalytics(
    `SELECT toDate(timestamp) day, blob4 kind, SUM(_sample_interval) hits, SUM(double3 * _sample_interval) bytes, SUM(double2 * _sample_interval) latency FROM ${DATASET} WHERE index1 IN (${idList(projectIds)}) AND ${sinceFilter(since)} GROUP BY day, kind`,
  );
  const edge = new Map<string, EdgeDay>();
  const events: DailyAmount[] = [];
  for (const row of rows) {
    const day = String(row.day ?? "").slice(0, 10);
    const kind = String(row.kind ?? "");
    if (REQUEST_KINDS.has(kind)) {
      const entry = edge.get(day) ?? {
        day,
        requests: 0,
        bytes: 0,
        latencyTotal: 0,
      };
      entry.requests += number(row, "hits");
      entry.bytes += number(row, "bytes");
      entry.latencyTotal += number(row, "latency");
      edge.set(day, entry);
    } else if (kind === "pageview" || kind === "custom-event") {
      events.push({
        metric: "web_analytics_events",
        day,
        quantity: number(row, "hits"),
      });
    } else if (kind === "web-vital") {
      events.push({
        metric: "speed_insights_events",
        day,
        quantity: number(row, "hits"),
      });
    }
  }
  return { edge: [...edge.values()], events };
}
