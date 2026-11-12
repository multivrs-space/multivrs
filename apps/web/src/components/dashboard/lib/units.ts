/** Human-readable units for usage and observability figures. */

export function formatBytes(value: number): string {
  if (value < 1024) return `${Math.round(value)} B`;
  if (value < 1024 ** 2) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 ** 3) return `${(value / 1024 ** 2).toFixed(1)} MB`;
  if (value < 1024 ** 4) return `${(value / 1024 ** 3).toFixed(2)} GB`;
  return `${(value / 1024 ** 4).toFixed(2)} TB`;
}

export function formatDuration(milliseconds: number): string {
  if (milliseconds < 1_000) return `${Math.round(milliseconds)} ms`;
  if (milliseconds < 60_000) return `${(milliseconds / 1_000).toFixed(1)} s`;
  if (milliseconds < 3_600_000) {
    return `${(milliseconds / 60_000).toFixed(1)} min`;
  }
  return `${(milliseconds / 3_600_000).toFixed(1)} h`;
}

const PERIOD_DATE = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

/** The current calendar-month billing period, e.g. "Oct 1 – Oct 31". */
export function billingPeriodLabel(now = new Date()): string {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0),
  );
  return `${PERIOD_DATE.format(start)} – ${PERIOD_DATE.format(end)}`;
}
