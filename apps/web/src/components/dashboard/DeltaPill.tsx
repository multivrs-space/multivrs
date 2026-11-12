import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export type DeltaTone = "positive" | "negative" | "neutral";

/** Status shades the dashboard already uses, paired for light and dark. */
export const TONE_CLASSES: Record<DeltaTone, string> = {
  positive:
    "border-emerald-600/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/20 dark:text-emerald-300",
  negative:
    "border-rose-600/20 bg-rose-500/10 text-rose-700 dark:border-rose-400/20 dark:text-rose-300",
  neutral: "border-hairline-strong bg-foreground/4 text-muted-foreground",
};

interface DeltaPillProps {
  /** Change in percent (or points with `unit="pt"`); null means no baseline. */
  value: number | null;
  /** For metrics where down is good, such as bounce or error rate. */
  invert?: boolean;
  unit?: "%" | "pt";
  className?: string;
}

/**
 * A small raised chip with the change since the previous period. Shows a
 * neutral dash when there is nothing honest to compare against.
 */
export function DeltaPill({
  value,
  invert = false,
  unit = "%",
  className,
}: DeltaPillProps) {
  const flat = value === null || Math.abs(value) < 0.05;
  const up = !flat && value > 0;
  const good = up !== invert;
  const tone: DeltaTone = flat ? "neutral" : good ? "positive" : "negative";
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight;
  const label =
    value === null
      ? "No previous data"
      : `${up ? "+" : ""}${value.toFixed(Math.abs(value) < 10 ? 1 : 0)}${unit === "pt" ? " pt" : "%"}`;

  return (
    <span
      className={cn(
        "figure inline-flex h-6 shrink-0 items-center gap-0.5 rounded-full border px-2 text-[11px] font-semibold",
        TONE_CLASSES[tone],
        className,
      )}
      title={value === null ? "No data for the previous period" : undefined}
    >
      <Icon aria-hidden="true" className="size-3" strokeWidth={2.25} />
      {value === null ? "—" : label}
      <span className="sr-only">
        {value === null ? label : " versus previous period"}
      </span>
    </span>
  );
}
