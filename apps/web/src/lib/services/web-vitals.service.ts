import "server-only";
import type {
  AnalyticsRange,
  WebVitalMetric,
  WebVitalRoute,
  WebVitalsData,
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

const VITAL_NAMES = ["CLS", "INP", "LCP", "TTFB"] as const;

export async function getProjectWebVitals(
  projectId: string,
  range: AnalyticsRange = "24h",
): Promise<WebVitalsData> {
  const id = sqlProjectId(projectId);
  if (!analyticsConfigured()) {
    return {
      devices: [],
      metrics: [],
      range,
      routes: [],
      state: "unconfigured",
    };
  }
  try {
    const period = RANGE_SQL[range].interval;
    const filter = `index1 = '${id}' AND blob4 = 'web-vital' AND timestamp >= NOW() - INTERVAL '${period}'`;
    const [rows, routeRows, deviceRows] = await Promise.all([
      queryAnalytics(
        `SELECT blob5 name, quantile(0.75)(double1) value, SUM(_sample_interval) samples, 100 * SUM(if(blob6 = 'good', _sample_interval, 0)) / SUM(_sample_interval) goodRate FROM ${DATASET} WHERE ${filter} GROUP BY name`,
      ),
      queryAnalytics(
        `SELECT blob3 path, blob5 name, quantile(0.75)(double1) value, SUM(_sample_interval) samples FROM ${DATASET} WHERE ${filter} GROUP BY path, name ORDER BY samples DESC LIMIT 80`,
      ),
      queryAnalytics(
        `SELECT blob9 label, SUM(_sample_interval) requests FROM ${DATASET} WHERE ${filter} GROUP BY label ORDER BY requests DESC`,
      ),
    ]);
    const metrics = rows.flatMap((row): WebVitalMetric[] => {
      const name = VITAL_NAMES.find((candidate) => candidate === row.name);
      return name
        ? [
            {
              goodRate: number(row, "goodRate"),
              name,
              samples: number(row, "samples"),
              value: number(row, "value"),
            },
          ]
        : [];
    });
    return {
      devices: breakdown(deviceRows, "label"),
      metrics,
      range,
      routes: vitalRoutes(routeRows),
      state: "ready",
    };
  } catch {
    return { devices: [], metrics: [], range, routes: [], state: "error" };
  }
}

function vitalRoutes(rows: Record<string, unknown>[]): WebVitalRoute[] {
  const routes = new Map<string, WebVitalRoute>();
  for (const row of rows) {
    const path = typeof row.path === "string" ? row.path : "/";
    const name = VITAL_NAMES.find((candidate) => candidate === row.name);
    if (!name) continue;
    const route = routes.get(path) ?? { metrics: {}, path, samples: 0 };
    route.metrics[name] = number(row, "value");
    route.samples += number(row, "samples");
    routes.set(path, route);
  }
  return [...routes.values()]
    .sort((left, right) => right.samples - left.samples)
    .slice(0, 10);
}
