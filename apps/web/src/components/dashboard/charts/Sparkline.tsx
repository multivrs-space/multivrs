import { useId } from "react";
import {
  areaPath,
  niceCeil,
  plotPoints,
  smoothPath,
} from "@/components/dashboard/lib/chart-math";
import { cn } from "@/lib/utils";

interface SparklineProps {
  values: readonly number[];
  /** `primary` for the headline series, `muted` for supporting ones. */
  tone?: "primary" | "muted";
  className?: string;
  label: string;
}

const WIDTH = 240;
const HEIGHT = 64;

/**
 * A small trend line with a soft fill and a dot on the latest value. Pure
 * SVG, so it renders on the server and costs nothing to hydrate.
 */
export function Sparkline({
  values,
  tone = "primary",
  className,
  label,
}: SparklineProps) {
  const id = useId();
  const points = plotPoints(
    values,
    niceCeil(Math.max(...values, 0)),
    WIDTH,
    HEIGHT - 6,
  );
  const last = points.at(-1);
  const stroke =
    tone === "primary" ? "var(--primary)" : "var(--muted-foreground)";

  if (points.length < 2) {
    return (
      <div
        className={cn("chart-bed flex items-end rounded-tile", className)}
        role="img"
        aria-label={`${label}: not enough data yet`}
      >
        <div className="h-px w-full bg-hairline-strong" />
      </div>
    );
  }

  return (
    <svg
      aria-label={label}
      className={cn("overflow-visible", className)}
      preserveAspectRatio="none"
      role="img"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
    >
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.28} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath(points, HEIGHT)} fill={`url(#${id})`} />
      <path
        d={smoothPath(points)}
        fill="none"
        stroke={stroke}
        strokeLinecap="round"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
      />
      {last ? (
        // Zero-length round-capped strokes stay perfect circles even though
        // the SVG stretches to its box.
        <>
          <path
            d={`M${last.x},${last.y}h0`}
            stroke={stroke}
            strokeLinecap="round"
            strokeWidth={9}
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={`M${last.x},${last.y}h0`}
            stroke="var(--ink)"
            strokeLinecap="round"
            strokeWidth={4}
            vectorEffect="non-scaling-stroke"
          />
        </>
      ) : null}
    </svg>
  );
}
