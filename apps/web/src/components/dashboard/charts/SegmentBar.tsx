import { cn } from "@/lib/utils";

interface SegmentBarProps {
  /** 0–100. */
  value: number;
  segments?: number;
  tone?: "positive" | "primary";
  label: string;
  className?: string;
}

const TONES = {
  positive: "bg-emerald-500",
  primary: "bg-primary",
};

/** A row of pill segments lit to a percentage, like an equaliser. */
export function SegmentBar({
  value,
  segments = 12,
  tone = "positive",
  label,
  className,
}: SegmentBarProps) {
  const lit = Math.round((Math.min(Math.max(value, 0), 100) / 100) * segments);
  return (
    <div
      aria-label={`${label}: ${Math.round(value)}%`}
      className={cn("flex h-2 gap-[3px]", className)}
      role="img"
    >
      {Array.from({ length: segments }, (_, index) => index).map((index) => (
        <span
          className={cn(
            "flex-1 rounded-full transition-colors",
            index < lit ? TONES[tone] : "bg-foreground/[0.09]",
          )}
          key={index}
        />
      ))}
    </div>
  );
}
