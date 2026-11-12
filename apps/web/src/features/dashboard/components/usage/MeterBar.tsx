import { TONE_FILL } from "@/features/dashboard/components/usage/meter-tone";
import type { MeterTone } from "@/features/dashboard/lib/usage-meters";
import { cn } from "@/lib/utils";

/** A thin track filled to the share used; full and red once past 100%. */
export function MeterBar({
  share,
  tone,
  className,
}: {
  share: number;
  tone: MeterTone;
  className?: string;
}) {
  const width = share > 0 ? Math.max(Math.min(share, 1) * 100, 1.5) : 0;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative block h-1.5 overflow-hidden rounded-full bg-foreground/[0.07]",
        className,
      )}
    >
      <span
        className={cn(
          "absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out-expo",
          TONE_FILL[tone],
        )}
        style={{ width: `${width}%` }}
      />
    </span>
  );
}
