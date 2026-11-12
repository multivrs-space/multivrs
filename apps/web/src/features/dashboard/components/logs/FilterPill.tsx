import { formatCompact } from "@/components/dashboard/lib/format";
import { cn } from "@/lib/utils";

/** A toggle chip for a log facet, with its colour dot and count. */
export function FilterPill({
  label,
  dot,
  count,
  active,
  onToggle,
}: {
  label: string;
  dot: string;
  count: number;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={cn(
        "flex h-9 items-center gap-2 rounded-full px-3 text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "surface-raised text-foreground"
          : "border border-hairline text-muted-foreground hover:text-foreground",
      )}
      onClick={onToggle}
      type="button"
    >
      <span className={cn("size-2 rounded-full", dot)} />
      {label}
      <span className="figure text-[11px] text-muted-foreground">
        {formatCompact(count)}
      </span>
    </button>
  );
}
