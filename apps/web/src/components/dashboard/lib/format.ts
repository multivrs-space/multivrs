const COMPACT = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const WHOLE = new Intl.NumberFormat("en");

/** 200912 → "200.9K"; small numbers stay whole. */
export function formatCompact(value: number): string {
  return Math.abs(value) < 10_000
    ? WHOLE.format(Math.round(value))
    : COMPACT.format(value);
}

export function formatWhole(value: number): string {
  return WHOLE.format(Math.round(value));
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

/**
 * Period-over-period change in percent, or null when there is no baseline to
 * compare against (a zero or missing previous value).
 */
export function percentChange(
  current: number,
  previous: number | null | undefined,
): number | null {
  if (previous === null || previous === undefined || previous === 0) {
    return null;
  }
  return ((current - previous) / previous) * 100;
}

/** Change between two rates, in percentage points. */
export function pointChange(
  current: number,
  previous: number | null | undefined,
): number | null {
  if (previous === null || previous === undefined) return null;
  return current - previous;
}

/** Share of a total as a 0–100 percentage, safe for empty totals. */
export function shareOf(value: number, total: number): number {
  return total > 0 ? (value / total) * 100 : 0;
}
