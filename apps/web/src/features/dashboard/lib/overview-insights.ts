import { formatPercent } from "@/components/dashboard/lib/format";
import type { DeployStats } from "@/features/dashboard/types/overview.types";
import type { UsagePoint } from "@/features/dashboard/types/usage.types";

const DAY_MS = 86_400_000;

type DayRequests = Pick<UsagePoint, "day" | "requests">;
export const WEEKDAYS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;

/** The last 7 days against the 7 before; days with no traffic count as 0. */
export function weekOverWeek(series: readonly DayRequests[], now = Date.now()) {
  const today = Math.floor(now / DAY_MS) * DAY_MS;
  let current = 0;
  let previous = 0;
  for (const point of series) {
    const age =
      (today - Date.parse(`${point.day.slice(0, 10)}T00:00:00Z`)) / DAY_MS;
    if (age >= 0 && age < 7) current += point.requests;
    else if (age >= 7 && age < 14) previous += point.requests;
  }
  const change = previous > 0 ? ((current - previous) / previous) * 100 : null;
  return { current, previous, change };
}

/** Share of finished deploys that went live; building ones don't count yet. */
export function deploySuccessRate(stats: DeployStats): number | null {
  const finished = stats.ready + stats.failed;
  return finished ? (stats.ready / finished) * 100 : null;
}

export interface Headline {
  lead: string;
  figure: string;
  tail: string;
  /** Where the card's button goes to act on what it says. */
  next: "failed-deploys" | "usage" | "deployments" | "new-project";
}

interface HeadlineInput {
  failing: number;
  traffic: { change: number | null; current: number };
  deploys: DeployStats;
  peak: { day: string; hour: number } | null;
}

/** The one thing most worth saying about the workspace, from its own numbers. */
export function headline({
  failing,
  traffic,
  deploys,
  peak,
}: HeadlineInput): Headline {
  if (failing > 0) {
    return {
      lead: "",
      figure: String(failing),
      tail:
        failing === 1
          ? "project failed its latest deploy. The build log shows why."
          : "projects failed their latest deploy. The build logs show why.",
      next: "failed-deploys",
    };
  }
  const when = peak
    ? `, busiest on ${peak.day}s around ${String(peak.hour).padStart(2, "0")}:00 UTC.`
    : ".";
  if (traffic.change !== null && Math.abs(traffic.change) >= 5) {
    const sign = traffic.change > 0 ? "+" : "";
    return {
      lead: `Traffic is ${traffic.change > 0 ? "up" : "down"}`,
      figure: `${sign}${formatPercent(traffic.change, 0)}`,
      tail: `on last week${when}`,
      next: "usage",
    };
  }
  const rate = deploySuccessRate(deploys);
  if (rate !== null) {
    return {
      lead: "Deploys went live",
      figure: formatPercent(rate, 0),
      tail: "of the time in the last 30 days.",
      next: "deployments",
    };
  }
  if (traffic.current > 0)
    return {
      lead: "Traffic is",
      figure: "steady",
      tail: `this week${when}`,
      next: "usage",
    };
  return {
    lead: "Your workspace is",
    figure: "ready",
    tail: "Deploy a project and its traffic, builds and mail show up here.",
    next: "new-project",
  };
}

/** The last `days` UTC days oldest first, with days that had no traffic as 0. */
export function dailyRequests(
  series: readonly DayRequests[],
  days = 14,
  now = Date.now(),
) {
  const today = Math.floor(now / DAY_MS) * DAY_MS;
  const byDay = new Map(
    series.map((point) => [point.day.slice(0, 10), point.requests]),
  );
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today - (days - 1 - index) * DAY_MS);
    return {
      label: date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      }),
      value: byDay.get(date.toISOString().slice(0, 10)) ?? 0,
    };
  });
}
