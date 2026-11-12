import { cn } from "@/lib/utils";

const R = 20;
const RING_TONES = {
  primary: "stroke-primary",
  positive: "stroke-emerald-500",
  muted: "stroke-muted-foreground/50",
  warning: "stroke-amber-500",
  danger: "stroke-rose-500",
} as const;
const C = 2 * Math.PI * R;

/** A thin ring that fills clockwise; the centre is left for an icon or count. */
export function ProgressRing({
  value,
  tone = "primary",
  className,
  children,
}: {
  value: number;
  tone?: "primary" | "positive" | "muted" | "warning" | "danger";
  className?: string;
  children?: React.ReactNode;
}) {
  const share = Math.min(Math.max(value, 0), 1);
  return (
    <span
      className={cn(
        "relative grid size-12 shrink-0 place-items-center",
        className,
      )}
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 -rotate-90"
        viewBox="0 0 48 48"
      >
        <circle
          className="stroke-foreground/10"
          cx="24"
          cy="24"
          fill="none"
          r={R}
          strokeWidth="3.5"
        />
        {share > 0 ? (
          <circle
            className={cn(
              "transition-[stroke-dashoffset] duration-700 ease-out-expo",
              RING_TONES[tone],
            )}
            cx="24"
            cy="24"
            fill="none"
            r={R}
            strokeDasharray={C}
            strokeDashoffset={C * (1 - share)}
            strokeLinecap="round"
            strokeWidth="3.5"
          />
        ) : null}
      </svg>
      <span className="relative">{children}</span>
    </span>
  );
}
