import type { OrbTone } from "@/components/dashboard/StatusOrb";

/** Display statuses used by the deployments list ("Ready", "Building"…). */
export function deploymentTone(status: string): OrbTone {
  switch (status) {
    case "Ready":
      return "ready";
    case "Building":
      return "building";
    case "Queued":
      return "queued";
    case "Failed":
      return "error";
    default:
      return "idle";
  }
}

export interface DayGroup<T> {
  key: string;
  label: string;
  items: T[];
}

const DAY = new Intl.DateTimeFormat("en", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/**
 * Split a newest-first list into calendar days: "Today", "Yesterday", then
 * "Fri, Oct 24". Order inside each day is kept as given.
 */
export function groupByDay<T extends { createdAt: string }>(
  items: readonly T[],
  now: Date = new Date(),
): DayGroup<T>[] {
  const today = dayKey(now);
  const yesterday = dayKey(
    new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
  );
  const groups: DayGroup<T>[] = [];
  for (const item of items) {
    const date = new Date(item.createdAt);
    const key = Number.isNaN(date.getTime()) ? "unknown" : dayKey(date);
    let group = groups.find((candidate) => candidate.key === key);
    if (!group) {
      const label =
        key === today
          ? "Today"
          : key === yesterday
            ? "Yesterday"
            : key === "unknown"
              ? "Earlier"
              : DAY.format(date);
      group = { key, label, items: [] };
      groups.push(group);
    }
    group.items.push(item);
  }
  return groups;
}
