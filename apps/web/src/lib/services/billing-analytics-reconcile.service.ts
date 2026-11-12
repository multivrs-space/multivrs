import "server-only";
import { z } from "zod";
import { METER_CATALOG } from "@/lib/payments/billing.catalog";
import { hourEnd, reconcileWindow } from "@/lib/payments/reconcile-window";
import {
  reconcileEntries,
  type UsageRow,
} from "@/lib/services/billing-reconcile-entries.service";

const responseSchema = z.object({
  data: z.array(z.record(z.string(), z.unknown())),
});

/**
 * Copy edge usage from Analytics Engine into billing, one row per project,
 * metric and hour. Each run re-reads the last 48 closed hours, so a missed
 * or once-a-day cron still meters every hour exactly once.
 */
export async function reconcileCloudflareBillingUsage(now = new Date()) {
  const { start, end } = reconcileWindow(now);
  // Read a little more than the window, relative to NOW (the form Analytics
  // Engine reads reliably), then keep only whole hours inside it below.
  const window = "timestamp >= NOW() - INTERVAL '3' DAY";
  const hourly = (
    select: string,
    dataset: string,
    filter: string,
    group = "",
  ) =>
    analyticsSql(
      `SELECT toStartOfHour(timestamp) hour, index1 projectId, ${select} FROM ${dataset} WHERE ${[filter, window].filter(Boolean).join(" AND ")} GROUP BY hour, projectId${group}`,
    );
  const [requests, runtime, webAnalytics, speedInsights] = await Promise.all([
    hourly(
      "SUM(_sample_interval) requests, SUM(double3 * _sample_interval) bytes",
      "multivrs_requests",
      "blob4 = 'request'",
    ),
    hourly(
      "blob1 metric, SUM(double1 * _sample_interval) quantity",
      "multivrs_usage",
      "",
      ", metric",
    ),
    hourly(
      "SUM(_sample_interval) quantity",
      "multivrs_requests",
      "blob4 IN ('pageview', 'custom-event')",
    ),
    hourly(
      "SUM(_sample_interval) quantity",
      "multivrs_requests",
      "blob4 = 'web-vital'",
    ),
  ]);
  const entries = [
    ...requests.flatMap((row) => [
      usageRow(row, "edge_requests", "requests"),
      usageRow(row, "fast_data_transfer", "bytes"),
    ]),
    ...runtime.map((row) =>
      usageRow(row, String(row.metric ?? ""), "quantity"),
    ),
    ...webAnalytics.map((row) =>
      usageRow(row, "web_analytics_events", "quantity"),
    ),
    ...speedInsights.map((row) =>
      usageRow(row, "speed_insights_events", "quantity"),
    ),
  ].filter(
    (row): row is UsageRow =>
      row !== null &&
      Boolean(METER_CATALOG[row.metric]) &&
      row.quantity > 0 &&
      row.periodEnd > start &&
      row.periodEnd <= end,
  );
  const result = await reconcileEntries(entries);
  return {
    ...result,
    periodStart: start.toISOString(),
    periodEnd: end.toISOString(),
  };
}

function usageRow(
  row: Record<string, unknown>,
  metric: string,
  value: string,
): UsageRow | null {
  const quantity = Math.max(0, Math.round(Number(row[value] ?? 0)));
  const projectId = String(row.projectId ?? "");
  const periodEnd = hourEnd(row.hour);
  return periodEnd && z.uuid().safeParse(projectId).success
    ? { metric, projectId, quantity, periodEnd }
    : null;
}

async function analyticsSql(sql: string) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_ANALYTICS_API_TOKEN;
  if (!accountId || !token)
    throw new Error("Cloudflare Analytics billing is not configured");
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/analytics_engine/sql`,
    {
      body: sql,
      headers: { authorization: `Bearer ${token}` },
      method: "POST",
    },
  );
  if (!response.ok)
    throw new Error(`Cloudflare Analytics returned ${response.status}`);
  return responseSchema.parse(await response.json()).data;
}
