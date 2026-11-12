import "server-only";
import type { RequestLogItem } from "@/features/dashboard/types/request-log.types";
import {
  analyticsConfigured,
  DATASET,
  number,
  queryAnalytics,
  sqlProjectId,
} from "@/lib/services/analytics-engine";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
const LIMIT = 500;

function text(row: Record<string, unknown>, key: string): string {
  const value = row[key];
  return typeof value === "string" ? value : "";
}

/**
 * The latest requests the edge served for these projects over the last
 * day, newest first. Null when Analytics Engine isn't configured.
 */
export async function listRequestLogs(
  projectIds: string[],
): Promise<RequestLogItem[] | null> {
  if (!analyticsConfigured()) return null;
  if (!projectIds.length) return [];
  const ids = projectIds.map((id) => `'${sqlProjectId(id)}'`).join(",");
  const kinds = ["request", ...METHODS].map((kind) => `'${kind}'`).join(",");
  const rows = await queryAnalytics(
    `SELECT timestamp, index1 projectId, blob1 deploymentId, blob2 host, blob3 path, blob4 kind, blob5 country, blob6 colo, blob7 method, double1 status, double2 duration, double3 bytes, _sample_interval weight FROM ${DATASET} WHERE index1 IN (${ids}) AND blob4 IN (${kinds}) AND timestamp >= NOW() - INTERVAL '1' DAY ORDER BY timestamp DESC LIMIT ${LIMIT}`,
  );
  return rows.map((row, index) => {
    const kind = text(row, "kind");
    const raw = text(row, "timestamp");
    // Analytics Engine returns "YYYY-MM-DD hh:mm:ss" in UTC.
    const parsed = Date.parse(
      raw.includes("T") ? raw : `${raw.replace(" ", "T")}Z`,
    );
    const timestamp = Number.isNaN(parsed)
      ? raw
      : new Date(parsed).toISOString();
    return {
      id: `${timestamp}-${index}`,
      timestamp,
      projectId: text(row, "projectId"),
      deploymentId: text(row, "deploymentId"),
      host: text(row, "host"),
      path: text(row, "path") || "/",
      // Older rows stored the method where the kind now goes.
      method: kind === "request" ? text(row, "method") || "GET" : kind,
      status: number(row, "status"),
      durationMs: number(row, "duration"),
      bytes: number(row, "bytes"),
      country: text(row, "country"),
      colo: text(row, "colo"),
      sampleInterval: Math.max(1, number(row, "weight")),
    };
  });
}
