import type { RequestLogItem } from "@/features/dashboard/types/request-log.types";
import type { RuntimeLogLevel } from "@/features/dashboard/types/runtime-log.types";

export type StatusClass = "ok" | "client" | "server";

/** 2xx and 3xx are fine, 4xx the visitor's problem, 5xx yours. */
export function statusClass(status: number): StatusClass {
  if (status >= 500) return "server";
  if (status >= 400) return "client";
  return "ok";
}

/** Status classes as log levels, so request rows share the log histogram. */
export function statusLevel(status: number): RuntimeLogLevel {
  const kind = statusClass(status);
  return kind === "server" ? "error" : kind === "client" ? "warn" : "info";
}

function percentile(sorted: readonly number[], p: number): number | null {
  if (!sorted.length) return null;
  return (
    sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))] ?? null
  );
}

/**
 * Totals for the rows on screen, each weighted by how many requests it
 * stands for. Latency percentiles are over the rows themselves.
 */
export function requestStats(rows: readonly RequestLogItem[]) {
  let total = 0;
  const counts: Record<StatusClass, number> = { ok: 0, client: 0, server: 0 };
  for (const row of rows) {
    total += row.sampleInterval;
    counts[statusClass(row.status)] += row.sampleInterval;
  }
  const durations = rows.map((row) => row.durationMs).sort((a, b) => a - b);
  return {
    total,
    counts,
    serverRate: total ? (counts.server / total) * 100 : null,
    clientRate: total ? (counts.client / total) * 100 : null,
    p50: percentile(durations, 0.5),
    p95: percentile(durations, 0.95),
    sampled: rows.some((row) => row.sampleInterval > 1),
  };
}
