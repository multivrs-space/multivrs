import type { TrafficBucket } from "@/components/dashboard/charts/TrafficChart";

interface TrafficColumnProps {
  bucket: TrafficBucket;
  isPeak: boolean;
  valueLabel: string;
  rateLabel?: string;
  format: (value: number) => string;
}

/**
 * One period's hover target over the traffic chart: a soft capsule behind the
 * bar and a raised readout, both pure CSS so the chart needs no JavaScript.
 */
export function TrafficColumn({
  bucket,
  isPeak,
  valueLabel,
  rateLabel,
  format,
}: TrafficColumnProps) {
  return (
    <div className="group/col relative flex-1">
      <div className="absolute inset-y-0 left-1/2 w-[72%] -translate-x-1/2 rounded-full bg-foreground/0 transition-colors duration-200 group-hover/col:bg-foreground/5" />
      {isPeak ? (
        <span className="surface-raised absolute left-1/2 top-1 -translate-x-1/2 rounded-full px-2 py-0.5 font-geist-mono text-[10px] text-foreground transition-opacity group-hover/col:opacity-0">
          Peak
        </span>
      ) : null}
      <div className="surface-raised pointer-events-none absolute left-1/2 top-1 z-10 w-max -translate-x-1/2 scale-95 rounded-tile px-2.5 py-2 text-[11px] opacity-0 transition duration-150 group-hover/col:scale-100 group-hover/col:opacity-100">
        <p className="font-geist-mono text-[10px] text-muted-foreground">
          {bucket.label}
        </p>
        <p className="figure mt-0.5 font-semibold text-foreground">
          {format(bucket.value)}{" "}
          <span className="font-normal text-muted-foreground">
            {valueLabel.toLowerCase()}
          </span>
        </p>
        {rateLabel && bucket.rate !== undefined ? (
          <p className="figure text-muted-foreground">
            {bucket.rate.toFixed(2)}% {rateLabel.toLowerCase()}
          </p>
        ) : null}
      </div>
    </div>
  );
}
