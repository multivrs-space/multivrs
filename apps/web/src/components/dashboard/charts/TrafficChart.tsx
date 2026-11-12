import { useId } from "react";
import { TrafficColumn } from "@/components/dashboard/charts/TrafficColumn";
import {
  axisTicks,
  labelStride,
  niceCeil,
  peakIndex,
  plotPoints,
  smoothPath,
  uniqueKeys,
} from "@/components/dashboard/lib/chart-math";
import { formatCompact } from "@/components/dashboard/lib/format";
import { cn } from "@/lib/utils";

export interface TrafficBucket {
  label: string;
  /** Bar value, e.g. page views. */
  value: number;
  /** Line value as a percentage, e.g. error rate. Omit for bars only. */
  rate?: number;
}

interface TrafficChartProps {
  buckets: TrafficBucket[];
  valueLabel: string;
  /** Name of the line series; omit to draw bars only. */
  rateLabel?: string;
  /** Formats bar values on the axis and in the readout (default: counts). */
  format?: (value: number) => string;
  className?: string;
}

const W = 600;
const H = 220;

/**
 * Bars for volume with a rate line over them, the peak bar lit in primary.
 * Server-rendered SVG; hover detail comes from CSS on an HTML column overlay.
 */
export function TrafficChart({
  buckets,
  valueLabel,
  rateLabel,
  format = formatCompact,
  className,
}: TrafficChartProps) {
  const id = useId();
  const values = buckets.map((bucket) => bucket.value);
  const ceiling = niceCeil(Math.max(...values, 0));
  const rateCeiling = niceCeil(Math.max(...buckets.map((b) => b.rate ?? 0), 1));
  const peak = peakIndex(values);
  const step = W / Math.max(buckets.length, 1);
  const barWidth = step * 0.58;
  const ratePoints = plotPoints(
    buckets.map((bucket) => bucket.rate ?? 0),
    rateCeiling,
    W,
    H,
  );
  const stride = labelStride(buckets.length);
  const keys = uniqueKeys(buckets.map((bucket) => bucket.label));

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="relative flex min-h-0 flex-1 gap-3">
        <div className="flex w-10 shrink-0 flex-col justify-between py-0 text-right font-geist-mono text-[10px] text-muted-foreground/70">
          {axisTicks(ceiling, 3).map((tick) => (
            <span
              className="-translate-y-1/2 first:translate-y-0 last:translate-y-0"
              key={tick}
            >
              {format(tick)}
            </span>
          ))}
        </div>
        <div className="relative min-w-0 flex-1">
          <svg
            aria-label={
              rateLabel
                ? `${valueLabel} per period with ${rateLabel.toLowerCase()} overlaid`
                : `${valueLabel} per period`
            }
            className="absolute inset-0 size-full"
            preserveAspectRatio="none"
            role="img"
            viewBox={`0 0 ${W} ${H}`}
          >
            <defs>
              <linearGradient id={`${id}-bar`} x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--foreground)"
                  stopOpacity={0.2}
                />
                <stop
                  offset="100%"
                  stopColor="var(--foreground)"
                  stopOpacity={0.04}
                />
              </linearGradient>
              <linearGradient id={`${id}-peak`} x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--primary)"
                  stopOpacity={0.95}
                />
                <stop
                  offset="100%"
                  stopColor="var(--primary)"
                  stopOpacity={0.25}
                />
              </linearGradient>
            </defs>
            {axisTicks(H, 3).map((y) => (
              <line
                key={y}
                stroke="var(--hairline-strong)"
                strokeDasharray="3 5"
                vectorEffect="non-scaling-stroke"
                x1={0}
                x2={W}
                y1={y}
                y2={y}
              />
            ))}
            {buckets.map((bucket, index) => {
              const height = (bucket.value / ceiling) * H;
              const x = index * step + (step - barWidth) / 2;
              return (
                <g key={keys[index]}>
                  <rect
                    fill={`url(#${id}-${index === peak ? "peak" : "bar"})`}
                    height={height}
                    width={barWidth}
                    x={x}
                    y={H - height}
                  />
                  <rect
                    fill={
                      index === peak
                        ? "var(--primary)"
                        : "var(--muted-foreground)"
                    }
                    height={Math.min(3, height)}
                    opacity={index === peak ? 1 : 0.55}
                    width={barWidth}
                    x={x}
                    y={H - height}
                  />
                </g>
              );
            })}
            {rateLabel ? (
              <path
                d={smoothPath(ratePoints)}
                fill="none"
                stroke="var(--foreground)"
                strokeOpacity={0.75}
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
          </svg>
          <div className="absolute inset-0 flex">
            {buckets.map((bucket, index) => (
              <TrafficColumn
                bucket={bucket}
                format={format}
                isPeak={index === peak}
                key={keys[index]}
                rateLabel={rateLabel}
                valueLabel={valueLabel}
              />
            ))}
          </div>
        </div>
      </div>
      {/* Labels centre on their column and may run wider than it, so dates
          like "Oct 12" stay whole when there are 30 columns. */}
      <div className="ml-13 mt-2 flex h-4">
        {buckets.map((bucket, index) => (
          <span className="relative min-w-0 flex-1" key={keys[index]}>
            {index % stride === 0 ? (
              <span className="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap font-geist-mono text-[10px] text-muted-foreground/70">
                {bucket.label}
              </span>
            ) : null}
          </span>
        ))}
      </div>
    </div>
  );
}
