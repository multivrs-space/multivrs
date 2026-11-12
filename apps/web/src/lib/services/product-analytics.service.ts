import "server-only";
import type { AnalyticsRange } from "@/features/dashboard/types/analytics.types";
import type { ProductAnalytics } from "@/features/dashboard/types/product-analytics.types";
import {
  analyticsConfigured,
  DATASET,
  formatBucket,
  number,
  queryAnalytics,
  RANGE_SQL,
  sqlProjectId,
} from "@/lib/services/analytics-engine";

const EMPTY = { events: 0, users: 0, visitors: 0, series: [], rows: [] };

/**
 * What people do, from the custom events these projects send with
 * `track()`: totals, the trend, and each event's reach.
 */
export async function getProductAnalytics(
  projectIds: string[],
  range: AnalyticsRange,
): Promise<ProductAnalytics> {
  if (!analyticsConfigured()) return { ...EMPTY, range, state: "unconfigured" };
  if (!projectIds.length) return { ...EMPTY, range, state: "ready" };
  const ids = projectIds.map((id) => `'${sqlProjectId(id)}'`).join(",");
  const { bucket, interval } = RANGE_SQL[range];
  const scope = `index1 IN (${ids}) AND timestamp >= NOW() - INTERVAL '${interval}'`;
  const events = `${scope} AND blob4 = 'custom-event' AND blob5 != ''`;
  try {
    const [totals, reach, series, names] = await Promise.all([
      queryAnalytics(
        `SELECT SUM(_sample_interval) events, uniq(blob6) users FROM ${DATASET} WHERE ${events}`,
      ),
      queryAnalytics(
        `SELECT uniq(blob6) visitors FROM ${DATASET} WHERE ${scope} AND blob4 = 'pageview'`,
      ),
      queryAnalytics(
        `SELECT ${bucket} bucket, SUM(_sample_interval) events, uniq(blob6) users FROM ${DATASET} WHERE ${events} GROUP BY bucket ORDER BY bucket`,
      ),
      queryAnalytics(
        `SELECT blob5 name, SUM(_sample_interval) events, uniq(blob6) users FROM ${DATASET} WHERE ${events} GROUP BY name ORDER BY events DESC LIMIT 20`,
      ),
    ]);
    const buckets = series.map((row) => String(row.bucket ?? ""));
    const top = names
      .slice(0, 10)
      .map((row) => String(row.name ?? "").replaceAll("'", "''"));
    const trends = top.length
      ? await queryAnalytics(
          `SELECT ${bucket} bucket, blob5 name, SUM(_sample_interval) events FROM ${DATASET} WHERE ${events} AND blob5 IN (${top.map((name) => `'${name}'`).join(",")}) GROUP BY name, bucket`,
        )
      : [];
    const trendOf = (name: string) =>
      buckets.map((key) =>
        number(
          trends.find(
            (row) => row.name === name && String(row.bucket ?? "") === key,
          ),
          "events",
        ),
      );
    return {
      state: "ready",
      range,
      events: number(totals[0], "events"),
      users: number(totals[0], "users"),
      visitors: number(reach[0], "visitors"),
      series: series.map((row) => ({
        label: formatBucket(row.bucket, range),
        events: number(row, "events"),
        users: number(row, "users"),
      })),
      rows: names.map((row) => {
        const name = String(row.name ?? "");
        return {
          name,
          events: number(row, "events"),
          users: number(row, "users"),
          trend: trendOf(name),
        };
      }),
    };
  } catch {
    return { ...EMPTY, range, state: "error" };
  }
}
