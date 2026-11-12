import { formatElapsed } from "@/features/dashboard/lib/format-elapsed";

/** How long a finished build took ("34s", "2m 27s"); null when unknown. */
export function buildDuration(
  startedAt: string | null,
  finishedAt: string | null,
): string | null {
  if (!startedAt || !finishedAt) return null;
  const seconds = Math.round(
    (Date.parse(finishedAt) - Date.parse(startedAt)) / 1_000,
  );
  return Number.isFinite(seconds) && seconds >= 0
    ? formatElapsed(seconds)
    : null;
}
