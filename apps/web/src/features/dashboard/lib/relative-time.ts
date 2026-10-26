const UNITS: ReadonlyArray<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 365 * 24 * 3_600_000],
  ["month", 30 * 24 * 3_600_000],
  ["week", 7 * 24 * 3_600_000],
  ["day", 24 * 3_600_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
];

const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** "3 days ago", "last month", "just now" for an ISO timestamp. */
export function relativeTime(raw: string): string {
  const timestamp = new Date(raw).getTime();
  if (!Number.isFinite(timestamp)) return "at an unknown time";
  const elapsed = timestamp - Date.now();
  for (const [unit, size] of UNITS) {
    if (Math.abs(elapsed) >= size) {
      return formatter.format(Math.round(elapsed / size), unit);
    }
  }
  return "just now";
}
