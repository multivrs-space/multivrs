import { cn } from "@/lib/utils";

/** A ring that turns while something is being fetched or started. */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-3.5 shrink-0 animate-spin rounded-full border-[1.75px] border-current border-t-transparent motion-reduce:animate-none",
        className,
      )}
    />
  );
}
