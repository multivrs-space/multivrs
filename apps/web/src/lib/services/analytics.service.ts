import "server-only";
import type {
  AnalyticsPoint,
  AnalyticsRange,
  PlatformAnalytics,
} from "@/features/dashboard/types/analytics.types";
import {
  analyticsConfigured,
  bounceSql,
  breakdown,
  DATASET,
  formatBucket,
  number,
  pageviewFilter,
  queryAnalytics,
  RANGE_SQL,
  requestFilter,
  sqlProjectId,
} from "@/lib/services/analytics-engine";

export { getProjectWebVitals } from "@/lib/services/web-vitals.service";

const EMPTY: PlatformAnalytics = {
  averageLatency: 0,
  bandwidthBytes: 0,
  bounceRate: 0,
  countries: [],
  devices: [],
  errorRate: 0,
  paths: [],
  pageviews: 0,
  range: "24h",
  referrers: [],
  requests: 0,
  sessions: 0,
  series: [],
  sources: [],
  state: "unconfigured",
  visitors: 0,
};

/** Countries are returned in full so the map can shade every one of them. */
const COUNTRY_LIMIT = 250;

export async function getProjectAnalytics(
  projectId: string,
  range: AnalyticsRange = "24h",
  includeAttribution = false,
): Promise<PlatformAnalytics> {
  const id = sqlProjectId(projectId);
  if (!analyticsConfigured()) return EMPTY;
  const selected = RANGE_SQL[range];
  const period = `timestamp >= NOW() - INTERVAL '${selected.interval}'`;
  const requests = requestFilter(id, period);
  const pages = pageviewFilter(id, period);
  const top = (column: string, filter: string, limit = 8) =>
    `SELECT ${column} label, SUM(_sample_interval) requests FROM ${DATASET} WHERE ${filter} GROUP BY label ORDER BY requests DESC LIMIT ${limit}`;
  try {
    const [
      summaryRows,
      seriesRows,
      pathRows,
      countryRows,
      audienceRows,
      pageSeriesRows,
      referrerRows,
      sourceRows,
      deviceRows,
      bounceRows,
    ] = await Promise.all([
      queryAnalytics(
        `SELECT SUM(_sample_interval) requests, AVG(double2) latency, SUM(if(double1 >= 500, _sample_interval, 0)) errors, SUM(double3 * _sample_interval) bytes FROM ${DATASET} WHERE ${requests}`,
      ),
      queryAnalytics(
        `SELECT ${selected.bucket} bucket, SUM(_sample_interval) requests, AVG(double2) latency, SUM(if(double1 >= 500, _sample_interval, 0)) errors, SUM(double3 * _sample_interval) bytes FROM ${DATASET} WHERE ${requests} GROUP BY bucket ORDER BY bucket`,
      ),
      queryAnalytics(top("blob3", requests)),
      queryAnalytics(top("blob5", requests, COUNTRY_LIMIT)),
      queryAnalytics(
        `SELECT SUM(_sample_interval) pageviews, uniq(blob6) visitors, uniq(blob7) sessions FROM ${DATASET} WHERE ${pages}`,
      ),
      queryAnalytics(
        `SELECT ${selected.bucket} bucket, SUM(_sample_interval) pageviews FROM ${DATASET} WHERE ${pages} GROUP BY bucket ORDER BY bucket`,
      ),
      queryAnalytics(top("blob5", `${pages} AND blob5 != ''`)),
      includeAttribution
        ? queryAnalytics(top("blob10", `${pages} AND blob10 != ''`))
        : Promise.resolve([]),
      queryAnalytics(top("blob8", pages)),
      queryAnalytics(bounceSql(pages)).catch(() => []),
    ]);
    const summary = summaryRows[0];
    const audience = audienceRows[0];
    const total = number(summary, "requests");
    return {
      averageLatency: Math.round(number(summary, "latency")),
      bandwidthBytes: number(summary, "bytes"),
      bounceRate: number(bounceRows[0], "bounceRate"),
      countries: breakdown(countryRows, "label"),
      devices: breakdown(deviceRows, "label"),
      errorRate: total ? (number(summary, "errors") / total) * 100 : 0,
      pageviews: number(audience, "pageviews"),
      paths: breakdown(pathRows, "label"),
      range,
      referrers: breakdown(referrerRows, "label"),
      requests: total,
      sessions: number(audience, "sessions"),
      series: mergeSeries(seriesRows, pageSeriesRows, range),
      sources: breakdown(sourceRows, "label"),
      state: "ready",
      visitors: number(audience, "visitors"),
    };
  } catch {
    return { ...EMPTY, range, state: "error" };
  }
}

/** Request buckets joined with pageview buckets; pageview-only buckets appended. */
function mergeSeries(
  seriesRows: Record<string, unknown>[],
  pageSeriesRows: Record<string, unknown>[],
  range: AnalyticsRange,
): AnalyticsPoint[] {
  const pageviewsByBucket = new Map(
    pageSeriesRows.map((row) => [
      String(row.bucket ?? ""),
      number(row, "pageviews"),
    ]),
  );
  const requestBuckets = new Set(
    seriesRows.map((row) => String(row.bucket ?? "")),
  );
  const series: AnalyticsPoint[] = seriesRows.map((row) => ({
    bandwidthBytes: number(row, "bytes"),
    errors: number(row, "errors"),
    label: formatBucket(row.bucket, range),
    latency: Math.round(number(row, "latency")),
    pageviews: pageviewsByBucket.get(String(row.bucket ?? "")) ?? 0,
    requests: number(row, "requests"),
  }));
  for (const row of pageSeriesRows) {
    if (requestBuckets.has(String(row.bucket ?? ""))) continue;
    series.push({
      bandwidthBytes: 0,
      errors: 0,
      label: formatBucket(row.bucket, range),
      latency: 0,
      pageviews: number(row, "pageviews"),
      requests: 0,
    });
  }
  return series;
}
