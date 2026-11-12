import { useId } from "react";
import { cn } from "@/lib/utils";

interface SegmentedGaugeProps {
  /** 0–100, or null when there is nothing to score yet. */
  value: number | null;
  label: string;
  /** Short word under the number, e.g. "Great". */
  caption?: string;
  /** How the number reads in the middle, e.g. "97.4%"; whole numbers by default. */
  format?: (value: number) => string;
  segments?: number;
  className?: string;
}

const CX = 120;
const CY = 120;
const RADIUS = 92;
const SEGMENT_LENGTH = 24;
const SEGMENT_WIDTH = 9;

/**
 * Trig results differ in the last digits between the server and browsers,
 * which breaks hydration for client-rendered gauges; two places is plenty.
 */
const round = (value: number) => Math.round(value * 100) / 100;

/**
 * A half-ring of rounded segments that fill from the left, the number in the
 * middle. Pure SVG; each lit segment brightens toward the end of the sweep.
 */
export function SegmentedGauge({
  value,
  label,
  caption,
  format = (score) => String(Math.round(score)),
  segments = 19,
  className,
}: SegmentedGaugeProps) {
  const id = useId();
  const lit = value === null ? 0 : Math.round((value / 100) * segments);

  return (
    <div
      className={cn(
        "relative mx-auto aspect-[240/150] w-full max-w-[320px]",
        className,
      )}
    >
      <svg
        aria-label={
          value === null
            ? `${label}: no data yet`
            : `${label}: ${format(value)} out of 100`
        }
        className="size-full"
        role="img"
        viewBox="0 0 240 150"
      >
        <defs>
          <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.55} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={1} />
          </linearGradient>
        </defs>
        {Array.from({ length: segments }, (_, index) => index).map((index) => {
          // Spread the segments across 180°, from the left end to the right.
          const angle = Math.PI - (index / (segments - 1)) * Math.PI;
          const x = round(CX + Math.cos(angle) * RADIUS);
          const y = round(CY - Math.sin(angle) * RADIUS);
          const rotation = round(90 - (angle * 180) / Math.PI);
          const on = index < lit;
          return (
            <rect
              className={on ? undefined : "fill-foreground/[0.09]"}
              fill={on ? `url(#${id})` : undefined}
              height={SEGMENT_LENGTH}
              key={index}
              opacity={on ? round(0.5 + (index / segments) * 0.5) : 1}
              rx={SEGMENT_WIDTH / 2}
              transform={`rotate(${rotation} ${x} ${y})`}
              width={SEGMENT_WIDTH}
              x={round(x - SEGMENT_WIDTH / 2)}
              y={round(y - SEGMENT_LENGTH / 2)}
            />
          );
        })}
      </svg>
      <div className="absolute inset-x-0 bottom-1 flex flex-col items-center">
        <p className="figure text-[44px] font-semibold leading-none text-foreground">
          {value === null ? "—" : format(value)}
        </p>
        <p className="mt-1.5 text-[12px] text-muted-foreground">
          {caption ?? label}
        </p>
      </div>
    </div>
  );
}
