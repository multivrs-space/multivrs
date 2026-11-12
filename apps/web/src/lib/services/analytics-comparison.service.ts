import "server-only";
import type {
  AnalyticsRange,
  AnalyticsTotals,
} from "@/features/dashboard/types/analytics.types";
import {
  analyticsConfigured,
  bounceSql,
  DATASET,
  number,
  pageviewFilter,
  queryAnalytics,
  RANGE_SQL,
  requestFilter,
  sqlProjectId,
} from "@/lib/services/analytics-engine";

/**
 * Totals for the window just before the selected one (the 24h before the last
 * 24h, and so on), so the page can show honest period-over-period deltas.
 * Returns null when analytics is unavailable rather than inventing a baseline.
 */
export async function getPreviousAnalyticsTotals(
  projectId: string,
  range: AnalyticsRange,
): Promise<AnalyticsTotals | null> {
  if (!analyticsConfigured()) return null;
  const id = sqlProjectId(projectId);
  const { interval, previous } = RANGE_SQL[range];
  const period = `timestamp >= NOW() - INTERVAL '${previous}' AND timestamp < NOW() - INTERVAL '${interval}'`;
  const pages = pageviewFilter(id, period);
  try {
    const [requestRows, audienceRows, bounceRows] = await Promise.all([
      queryAnalytics(
        `SELECT SUM(_sample_interval) requests, SUM(if(double1 >= 500, _sample_interval, 0)) errors FROM ${DATASET} WHERE ${requestFilter(id, period)}`,
      ),
      queryAnalytics(
        `SELECT SUM(_sample_interval) pageviews, uniq(blob6) visitors, uniq(blob7) sessions FROM ${DATASET} WHERE ${pages}`,
      ),
      queryAnalytics(bounceSql(pages)).catch(() => []),
    ]);
    const requests = number(requestRows[0], "requests");
    return {
      bounceRate: number(bounceRows[0], "bounceRate"),
      errorRate: requests
        ? (number(requestRows[0], "errors") / requests) * 100
        : 0,
      pageviews: number(audienceRows[0], "pageviews"),
      requests,
      sessions: number(audienceRows[0], "sessions"),
      visitors: number(audienceRows[0], "visitors"),
    };
  } catch {
    return null;
  }
}
