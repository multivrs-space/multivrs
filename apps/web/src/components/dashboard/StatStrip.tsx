import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface Stat {
  label: string;
  value: ReactNode;
  /** A short line under the value: a comparison, a unit, a caveat. */
  hint?: ReactNode;
  tone?: "default" | "warn" | "danger";
}

const TONES = {
  default: "text-foreground",
  warn: "text-amber-700 dark:text-amber-300",
  danger: "text-rose-700 dark:text-rose-300",
};

/** A row of headline figures in one card, divided by hairlines. */
export function StatStrip({
  stats,
  className,
}: {
  stats: Stat[];
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "surface-card grid grid-cols-2 overflow-hidden rounded-card md:grid-flow-col md:auto-cols-fr md:grid-cols-none",
        className,
      )}
    >
      {stats.map((stat, index) => (
        <div
          className={cn(
            "flex min-w-0 flex-col gap-2 p-4",
            index % 2 === 1 && "border-l border-hairline",
            index > 1 && "border-t border-hairline md:border-t-0",
            index > 0 && "md:border-l",
          )}
          key={stat.label}
        >
          <dt className="truncate text-[12.5px] text-muted-foreground">
            {stat.label}
          </dt>
          <dd
            className={cn(
              "figure truncate text-[26px] font-semibold leading-none tracking-[-0.02em]",
              TONES[stat.tone ?? "default"],
            )}
          >
            {stat.value}
          </dd>
          {stat.hint ? (
            <dd className="truncate text-[11.5px] text-muted-foreground">
              {stat.hint}
            </dd>
          ) : null}
        </div>
      ))}
    </dl>
  );
}
