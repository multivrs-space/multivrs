const HOUR_MS = 3_600_000;

/**
 * The hours a reconcile run covers: every whole hour of the last `hours`
 * that closed at least `settleMs` ago, so late edge writes have landed.
 * Runs overlap on purpose; per-hour idempotency keys stop double counts.
 */
export function reconcileWindow(
  now: Date,
  hours = 48,
  settleMs = 5 * 60_000,
): { start: Date; end: Date } {
  const end = Math.floor((now.getTime() - settleMs) / HOUR_MS) * HOUR_MS;
  return { start: new Date(end - hours * HOUR_MS), end: new Date(end) };
}

/** An Analytics Engine hour start ("2026-10-27 13:00:00", UTC) → that hour's end. */
export function hourEnd(value: unknown): Date | null {
  const text = String(value ?? "");
  const start = Date.parse(
    text.includes("T") ? text : `${text.replace(" ", "T")}Z`,
  );
  return Number.isNaN(start) ? null : new Date(start + HOUR_MS);
}

/** The key that marks one project's metric as metered for one hour. */
export function reconcileKey(
  projectId: string,
  metric: string,
  periodEnd: Date,
): string {
  return `cf:${projectId}:${metric}:${periodEnd.toISOString()}`;
}
