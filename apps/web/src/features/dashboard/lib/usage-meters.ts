import { formatCompact } from "@/components/dashboard/lib/format";
import type {
  AccountUsage,
  UsageMeter,
} from "@/features/dashboard/types/usage.types";

const DAY_MS = 86_400_000;
const GiB = 1024 ** 3;

export type MeterFormat = "count" | "bytes" | "minutes" | "duration";
export type MeterTone = "ok" | "near" | "over";

/** 5 → "5", 1.5 → "1.5", 38.437 → "38.44": no trailing zeros. */
const fixed = (value: number, digits: number) =>
  String(Number(value.toFixed(digits)));

function bytes(value: number): string {
  if (value < 1024) return `${Math.round(value)} B`;
  if (value < 1024 ** 2) return `${fixed(value / 1024, 1)} KB`;
  if (value < GiB) return `${fixed(value / 1024 ** 2, 1)} MB`;
  if (value < 1024 * GiB) return `${fixed(value / GiB, 1)} GB`;
  return `${fixed(value / (1024 * GiB), 2)} TB`;
}

function duration(ms: number): string {
  if (ms < 60_000) return `${Math.round(ms / 1_000)} s`;
  if (ms < 7_200_000) return `${fixed(ms / 60_000, 1)} min`;
  return `${fixed(ms / 3_600_000, 1)} h`;
}

/** A meter amount in its own unit, short enough for a row. */
export function formatAmount(value: number, format: MeterFormat): string {
  if (format === "bytes") return value ? bytes(value) : "0 B";
  if (format === "minutes")
    return `${formatCompact(Math.round(value / 60_000))} min`;
  if (format === "duration") return value ? duration(value) : "0 s";
  return formatCompact(value);
}

/** Used over included, or null when there's no cap to measure against. */
export function meterShare(meter: UsageMeter | undefined): number | null {
  if (!meter || meter.included === undefined || meter.included === null)
    return null;
  if (meter.included === 0) return meter.used > 0 ? Infinity : 0;
  return meter.used / meter.included;
}

export function meterTone(share: number | null): MeterTone {
  if (share === null || share < 0.75) return "ok";
  return share > 1 ? "over" : "near";
}

/** Running total through the period, one point per day. */
export function cumulative(daily: readonly number[]): number[] {
  let total = 0;
  return daily.map((value) => {
    total += value;
    return total;
  });
}

/**
 * Where this period ends if every remaining day matches the average so
 * far. Null in the first day, before there's a rate worth projecting.
 */
export function projectedTotal(
  meter: UsageMeter,
  period: AccountUsage["period"],
  now = Date.now(),
): number | null {
  if (!meter.daily.length) return null;
  const start = Date.parse(period.start);
  const length = (Date.parse(period.end) - start) / DAY_MS;
  const elapsed = (now - start) / DAY_MS;
  if (elapsed < 1 || elapsed >= length) return null;
  return (meter.used / elapsed) * length;
}

/** Billed meters at 75% of their allowance or more, the fullest first. */
export function metersNeedingAttention(
  meters: AccountUsage["meters"],
): { key: string; share: number }[] {
  return Object.entries(meters)
    .map(([key, meter]) => ({ key, share: meterShare(meter) }))
    .filter(
      (entry): entry is { key: string; share: number } =>
        entry.share !== null && entry.share >= 0.75,
    )
    .sort((a, b) => b.share - a.share);
}
