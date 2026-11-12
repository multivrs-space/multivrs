import type { TrafficHeat } from "@/features/dashboard/types/overview.types";

export const WEEKDAYS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;
const WEEKDAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/** Three-hour blocks, newest-looking first: rows 21–24 down to 00–03, columns Mon–Sun. */
export function heatBlocks(
  heat: TrafficHeat,
): { label: string; values: number[] }[] {
  return Array.from({ length: 8 }, (_, index) => 7 - index).map((block) => ({
    label: `${String(block * 3).padStart(2, "0")}:00`,
    values: heat.cells.map((day) =>
      day
        .slice(block * 3, block * 3 + 3)
        .reduce((sum, value) => sum + value, 0),
    ),
  }));
}

/** 0 for nothing (drawn hatched), then 1–4 by share of the busiest cell. */
export function heatLevel(value: number, max: number): 0 | 1 | 2 | 3 | 4 {
  if (value <= 0 || max <= 0) return 0;
  const ratio = value / max;
  return ratio < 0.25 ? 1 : ratio < 0.5 ? 2 : ratio < 0.75 ? 3 : 4;
}

const DAYPARTS = [
  { label: "Night", from: 0 },
  { label: "Morning", from: 6 },
  { label: "Afternoon", from: 12 },
  { label: "Evening", from: 18 },
] as const;

/** How the traffic splits across the UTC day, as shares that add to 100. */
export function dayparts(
  heat: TrafficHeat,
): { label: string; share: number }[] {
  return DAYPARTS.map(({ label, from }) => {
    const sum = heat.cells.reduce(
      (total, day) =>
        total + day.slice(from, from + 6).reduce((a, b) => a + b, 0),
      0,
    );
    return { label, share: heat.total ? (sum / heat.total) * 100 : 0 };
  });
}

/** The busiest weekday and hour, or null with no traffic. */
export function peakSlot(
  heat: TrafficHeat,
): { day: string; hour: number } | null {
  let best = { day: -1, hour: -1, value: 0 };
  heat.cells.forEach((hours, day) => {
    hours.forEach((value, hour) => {
      if (value > best.value) best = { day, hour, value };
    });
  });
  return best.day < 0
    ? null
    : { day: WEEKDAY_NAMES[best.day] ?? "", hour: best.hour };
}
