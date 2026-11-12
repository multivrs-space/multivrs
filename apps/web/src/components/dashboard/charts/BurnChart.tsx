import { useId } from "react";
import {
  areaPath,
  niceCeil,
  type Point,
  smoothPath,
} from "@/components/dashboard/lib/chart-math";
import { cn } from "@/lib/utils";

interface BurnChartProps {
  /** Running total at the end of each day so far. */
  totals: readonly number[];
  /** Days in the whole period, so the x axis runs to its end. */
  days: number;
  /** The plan's line; null or undefined draws none. */
  included?: number | null;
  /** Where the period lands at today's pace; drawn dashed to the end. */
  projected?: number | null;
  format: (value: number) => string;
  label: string;
  className?: string;
}

const W = 600;
const H = 200;
const pct = (value: number, of: number) => `${(value / of) * 100}%`;

/**
 * A period's running total climbing toward the plan's allowance: the area
 * is what's used, the dashed line where today's pace leads, and the hatched
 * band above the allowance is overage.
 */
export function BurnChart({
  totals,
  days,
  included,
  projected,
  format,
  label,
  className,
}: BurnChartProps) {
  const id = useId();
  const used = totals.at(-1) ?? 0;
  const limit = included ?? null;
  const ceiling = niceCeil(Math.max(used, limit ?? 0, projected ?? 0) * 1.12);
  const y = (value: number) => H - (Math.max(0, value) / ceiling) * H;
  const points: Point[] = [
    { x: 0, y: H },
    ...totals.map((value, day) => ({ x: ((day + 1) / days) * W, y: y(value) })),
  ];
  const last = points.at(-1) ?? { x: 0, y: H };
  const limitY = limit === null ? null : y(limit);

  return (
    <div className={cn("relative", className)}>
      {limitY === null ? null : (
        <div
          aria-hidden="true"
          className="hatch absolute inset-x-0 top-0 rounded-t-tile opacity-70"
          style={{ height: pct(limitY, H) }}
        />
      )}
      <svg
        aria-label={label}
        className="absolute inset-0 size-full overflow-visible"
        preserveAspectRatio="none"
        role="img"
        viewBox={`0 0 ${W} ${H}`}
      >
        <defs>
          <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.32} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <line
          stroke="var(--hairline-strong)"
          vectorEffect="non-scaling-stroke"
          x1={0}
          x2={W}
          y1={H}
          y2={H}
        />
        <path d={areaPath(points, H)} fill={`url(#${id})`} />
        <path
          d={smoothPath(points)}
          fill="none"
          stroke="var(--primary)"
          strokeLinecap="round"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        />
        {projected === null || projected === undefined ? null : (
          <line
            stroke="var(--primary)"
            strokeDasharray="4 5"
            strokeOpacity={0.55}
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
            x1={last.x}
            x2={W}
            y1={last.y}
            y2={y(projected)}
          />
        )}
        {limitY === null ? null : (
          <line
            stroke="var(--foreground)"
            strokeDasharray="2 4"
            strokeOpacity={0.5}
            vectorEffect="non-scaling-stroke"
            x1={0}
            x2={W}
            y1={limitY}
            y2={limitY}
          />
        )}
      </svg>
      {limit === null || limitY === null ? null : (
        <span
          className="absolute right-0 -translate-y-full pb-1 font-geist-mono text-[10.5px] text-muted-foreground"
          style={{ top: pct(limitY, H) }}
        >
          Included · {format(limit)}
        </span>
      )}
      <span
        aria-hidden="true"
        className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-4 ring-primary/20"
        style={{ left: pct(last.x, W), top: pct(last.y, H) }}
      />
    </div>
  );
}
