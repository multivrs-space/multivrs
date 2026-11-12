import type { UsageMeter } from "@/features/dashboard/types/usage.types";

const DAY_MS = 86_400_000;

/** One meter's amount on one UTC day (`YYYY-MM-DD`). */
export interface DailyAmount {
  metric: string;
  day: string;
  quantity: number;
}

/** Whole UTC days in the period, and how many have started by `now`. */
export function periodDays(
  period: { start: string; end: string },
  now = Date.now(),
) {
  const start = Date.parse(period.start);
  const total = Math.max(
    1,
    Math.round((Date.parse(period.end) - start) / DAY_MS),
  );
  const elapsed = Math.min(
    total,
    Math.max(1, Math.floor((now - start) / DAY_MS) + 1),
  );
  return { total, elapsed, left: total - elapsed };
}

/**
 * Fold daily amounts into one array per meter, a slot per elapsed day of
 * the period. Days before the period are ignored.
 */
export function foldDaily(
  amounts: readonly DailyAmount[],
  period: { start: string; end: string },
  now = Date.now(),
): Record<string, number[]> {
  const start = Date.parse(period.start.slice(0, 10));
  const { elapsed } = periodDays(period, now);
  const byMetric: Record<string, number[]> = {};
  for (const amount of amounts) {
    const index = Math.round((Date.parse(amount.day) - start) / DAY_MS);
    if (index < 0 || index >= elapsed || !amount.metric) continue;
    byMetric[amount.metric] ??= Array.from({ length: elapsed }, () => 0);
    const days = byMetric[amount.metric];
    if (days) days[index] = (days[index] ?? 0) + amount.quantity;
  }
  return byMetric;
}

/**
 * Every meter: flowing meters total their days, held amounts (storage,
 * mounts) come as they stand now. `included` is set only for billed keys.
 */
export function buildMeters(input: {
  daily: Record<string, number[]>;
  held: Record<string, number>;
  allowances: Record<string, number | null>;
}): Record<string, UsageMeter> {
  const meters: Record<string, UsageMeter> = {};
  const keys = new Set([
    ...Object.keys(input.daily),
    ...Object.keys(input.held),
    ...Object.keys(input.allowances),
  ]);
  for (const key of keys) {
    const daily = key in input.held ? [] : (input.daily[key] ?? []);
    const used =
      input.held[key] ?? daily.reduce((sum, value) => sum + value, 0);
    meters[key] =
      key in input.allowances
        ? { used, daily, included: input.allowances[key] }
        : { used, daily };
  }
  return meters;
}

const SHORT_DATE = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

/** "Oct 1", the period's last day "Oct 31", and the reset day "Nov 1". */
export function periodLabels(period: { start: string; end: string }) {
  const end = Date.parse(period.end);
  return {
    start: SHORT_DATE.format(Date.parse(period.start)),
    last: SHORT_DATE.format(end - DAY_MS),
    reset: SHORT_DATE.format(end),
  };
}
