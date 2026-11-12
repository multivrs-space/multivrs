import type { ReactNode } from "react";
import { DeltaPill } from "@/components/dashboard/DeltaPill";
import { cn } from "@/lib/utils";

interface MetricProps {
  label: string;
  value: string;
  /** Percent (or points) change since the previous period. */
  delta?: number | null;
  deltaUnit?: "%" | "pt";
  /** Lower is better, e.g. bounce rate. */
  invert?: boolean;
  size?: "lg" | "md";
  footnote?: ReactNode;
  className?: string;
}

/**
 * A headline figure, then its label with the change beside it, so the number
 * always has the full width of its column.
 */
export function Metric({
  label,
  value,
  delta,
  deltaUnit,
  invert,
  size = "lg",
  footnote,
  className,
}: MetricProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <p
        className={cn(
          "figure truncate font-semibold leading-none text-foreground",
          size === "lg" ? "text-[40px] xl:text-[44px]" : "text-[30px]",
        )}
      >
        {value}
      </p>
      <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <p className="text-[13px] text-muted-foreground">{label}</p>
        {delta !== undefined ? (
          <DeltaPill invert={invert} unit={deltaUnit} value={delta} />
        ) : null}
      </div>
      {footnote ? (
        <p className="mt-1 font-geist-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">
          {footnote}
        </p>
      ) : null}
    </div>
  );
}
