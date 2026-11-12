import type { UptimeDay } from "@/features/dashboard/types/uptime.types";
import { cn } from "@/lib/utils";

const DAY: Record<UptimeDay, string> = {
  up: "bg-emerald-500/80",
  degraded: "bg-amber-500",
  down: "bg-rose-500",
  none: "bg-foreground/10",
};

/** Ninety days at a glance, one tick per day, like a public status page. */
export function UptimeDays({
  days,
  className,
}: {
  days: readonly UptimeDay[];
  className?: string;
}) {
  const bad = days.filter((day) => day === "down" || day === "degraded").length;
  return (
    <div
      aria-label={`Last ${days.length} days: ${bad ? `${bad} with problems` : "no problems"}`}
      className={cn("flex h-6 items-stretch gap-[2px]", className)}
      role="img"
    >
      {days.map((day, index) => (
        <span
          className={cn("min-w-[2px] flex-1 rounded-[2px]", DAY[day])}
          // Days are positional; their order never changes.
          // biome-ignore lint/suspicious/noArrayIndexKey: one tick per day
          key={index}
        />
      ))}
    </div>
  );
}
