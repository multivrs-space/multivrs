import "server-only";
import { cacheLife } from "next/cache";
import { z } from "zod";
import type {
  AnalyticsBreakdownItem,
  AnalyticsRange,
} from "@/features/dashboard/types/analytics.types";

/** Cloudflare Analytics Engine plumbing shared by the analytics services. */

const analyticsResponseSchema = z.object({
  data: z.array(z.record(z.string(), z.unknown())),
});
const PROJECT_ID = z.uuid();

export const DATASET = "multivrs_requests";

/** Bucket expression, window length, and the window before it for deltas. */
export const RANGE_SQL: Record<
  AnalyticsRange,
  { bucket: string; interval: string; previous: string }
> = {
  "24h": {
    bucket: "toStartOfHour(timestamp)",
    interval: "1 DAY",
    previous: "2 DAY",
  },
  "7d": {
    bucket: "toStartOfDay(timestamp)",
    interval: "7 DAY",
    previous: "14 DAY",
  },
  "30d": {
    bucket: "toStartOfDay(timestamp)",
    interval: "30 DAY",
    previous: "60 DAY",
  },
};

export function analyticsConfigured(): boolean {
  return Boolean(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
      process.env.CLOUDFLARE_ANALYTICS_API_TOKEN,
  );
}

/** A project id that is safe to inline into Analytics Engine SQL. */
export function sqlProjectId(projectId: string): string {
  return PROJECT_ID.parse(projectId).replaceAll("'", "''");
}

export async function queryAnalytics(
  sql: string,
): Promise<Record<string, unknown>[]> {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 300 });

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_ANALYTICS_API_TOKEN;
  if (!accountId || !token)
    throw new Error("Cloudflare Analytics is not configured");
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/analytics_engine/sql`;
  const response = await fetch(endpoint, {
    body: sql,
    headers: { authorization: `Bearer ${token}` },
    method: "POST",
  });
  if (!response.ok) {
    // Analytics Engine explains SQL it can't run in the body; keep the start.
    const detail = (await response.text().catch(() => "")).slice(0, 300);
    throw new Error(
      `Cloudflare Analytics returned ${response.status}: ${detail}`,
    );
  }
  return analyticsResponseSchema.parse(await response.json()).data;
}

export function number(
  row: Record<string, unknown> | undefined,
  key: string,
): number {
  const value = row?.[key];
  return typeof value === "number" ? value : Number(value ?? 0);
}

export function breakdown(
  rows: Record<string, unknown>[],
  key: string,
): AnalyticsBreakdownItem[] {
  return rows.map((row) => ({
    label: typeof row[key] === "string" && row[key] ? row[key] : "Unknown",
    requests: number(row, "requests"),
  }));
}

export function formatBucket(value: unknown, range: AnalyticsRange): string {
  const text = String(value ?? "");
  return range === "24h" ? text.slice(11, 16) : text.slice(5, 10);
}

/** Request rows are logged with the HTTP method or the generic `request` kind. */
export function requestFilter(id: string, period: string): string {
  return `index1 = '${id}' AND (blob4 = 'request' OR blob4 IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS')) AND ${period}`;
}

export function pageviewFilter(id: string, period: string): string {
  return `index1 = '${id}' AND blob4 = 'pageview' AND ${period}`;
}

/** Share of sessions with a single pageview, as a percentage. */
export function bounceSql(pageFilter: string): string {
  return `SELECT 100 * countIf(pageviews = 1) / greatest(count(), 1) bounceRate FROM (SELECT blob7, SUM(_sample_interval) pageviews FROM ${DATASET} WHERE ${pageFilter} GROUP BY blob7)`;
}
