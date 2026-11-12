import { cn } from "@/lib/utils";

/** Production or Preview, and "Current" when it's what production serves. */
export function TargetPill({
  target,
  current,
}: {
  target: "Production" | "Preview";
  current: boolean;
}) {
  return (
    <span className="flex shrink-0 items-center gap-1">
      <span
        className={cn(
          "rounded-full px-2 py-px text-[10.5px] font-medium",
          target === "Production"
            ? "bg-primary/12 text-primary"
            : "bg-foreground/6 text-muted-foreground",
        )}
      >
        {target}
      </span>
      {current ? (
        <span className="flex items-center gap-1 rounded-full bg-emerald-500/12 px-2 py-px text-[10.5px] font-medium text-emerald-700 dark:text-emerald-300">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Current
        </span>
      ) : null}
    </span>
  );
}
