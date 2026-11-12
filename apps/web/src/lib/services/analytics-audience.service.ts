import "server-only";
import type {
  AnalyticsAudience,
  AnalyticsRange,
} from "@/features/dashboard/types/analytics.types";
import {
  analyticsConfigured,
  breakdown,
  DATASET,
  number,
  queryAnalytics,
  RANGE_SQL,
  sqlProjectId,
} from "@/lib/services/analytics-engine";

const EMPTY: AnalyticsAudience = {
  live: 0,
  countries: [],
  cities: [],
  browsers: [],
  events: [],
};

/**
 * Page-view and event rows carry visitor, browser and (from the edge) the
 * visitor's country and city, so these read people, not raw requests.
 */
export async function getAnalyticsAudience(
  projectId: string,
  range: AnalyticsRange,
): Promise<AnalyticsAudience> {
  if (!analyticsConfigured()) return EMPTY;
  const id = sqlProjectId(projectId);
  const period = `timestamp >= NOW() - INTERVAL '${RANGE_SQL[range].interval}'`;
  const views = `index1 = '${id}' AND blob4 = 'pageview' AND ${period}`;
  const events = `index1 = '${id}' AND blob4 = 'custom-event' AND ${period}`;
  const people = (column: string, filter: string, limit: number) =>
    queryAnalytics(
      `SELECT ${column} label, uniq(blob6) requests FROM ${DATASET} WHERE ${filter} AND ${column} != '' GROUP BY label ORDER BY requests DESC LIMIT ${limit}`,
    );
  try {
    const [live, countries, cities, browsers, eventRows] = await Promise.all([
      queryAnalytics(
        `SELECT uniq(blob6) live FROM ${DATASET} WHERE index1 = '${id}' AND blob4 IN ('pageview', 'custom-event') AND timestamp >= NOW() - INTERVAL '5' MINUTE`,
      ),
      people("blob14", views, 250),
      queryAnalytics(
        `SELECT concat(blob15, ', ', blob14) label, uniq(blob6) requests FROM ${DATASET} WHERE ${views} AND blob15 != '' GROUP BY label ORDER BY requests DESC LIMIT 8`,
      ),
      people("blob9", views, 8),
      queryAnalytics(
        `SELECT blob5 label, SUM(_sample_interval) requests FROM ${DATASET} WHERE ${events} AND blob5 != '' GROUP BY label ORDER BY requests DESC LIMIT 12`,
      ),
    ]);
    return {
      live: number(live[0], "live"),
      countries: breakdown(countries, "label"),
      cities: breakdown(cities, "label"),
      browsers: breakdown(browsers, "label"),
      events: breakdown(eventRows, "label"),
    };
  } catch {
    return EMPTY;
  }
}
