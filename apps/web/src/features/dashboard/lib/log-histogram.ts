import type {
  RuntimeLogItem,
  RuntimeLogLevel,
} from "@/features/dashboard/types/runtime-log.types";

export interface LogBucket {
  start: number;
  end: number;
  counts: Record<RuntimeLogLevel, number>;
}

/**
 * Spread log events across `buckets` equal slices of the time they cover,
 * counting each level, oldest slice first. Empty input gives no buckets.
 */
export function bucketLogs(
  logs: readonly Pick<RuntimeLogItem, "timestamp" | "level">[],
  buckets = 40,
): LogBucket[] {
  const times = logs
    .map((log) => new Date(log.timestamp).getTime())
    .filter((time) => Number.isFinite(time));
  if (!times.length) return [];
  const first = Math.min(...times);
  const last = Math.max(...times);
  const span = Math.max(last - first, 60_000);
  const size = span / buckets;
  const result: LogBucket[] = Array.from({ length: buckets }, (_, index) => ({
    start: first + index * size,
    end: first + (index + 1) * size,
    counts: { info: 0, warn: 0, error: 0 },
  }));
  for (const log of logs) {
    const time = new Date(log.timestamp).getTime();
    if (!Number.isFinite(time)) continue;
    const index = Math.min(buckets - 1, Math.floor((time - first) / size));
    const bucket = result[index];
    if (bucket) bucket.counts[log.level] += 1;
  }
  return result;
}

export function levelCounts(
  logs: readonly RuntimeLogItem[],
): Record<RuntimeLogLevel, number> {
  const counts: Record<RuntimeLogLevel, number> = {
    info: 0,
    warn: 0,
    error: 0,
  };
  for (const log of logs) counts[log.level] += 1;
  return counts;
}
