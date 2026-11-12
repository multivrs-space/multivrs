import { niceCeil } from "@/components/dashboard/lib/chart-math";
import type { LogBucket } from "@/features/dashboard/lib/log-histogram";

const W = 800;
const H = 80;
const LAYERS = [
  { level: "info", className: "fill-foreground/20" },
  { level: "warn", className: "fill-amber-500/80" },
  { level: "error", className: "fill-rose-500" },
] as const;

const TIME = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

/** Events over time, stacked info → warn → error, so spikes of errors show. */
export function LogHistogram({
  buckets,
  label = "Log events over time by level",
}: {
  buckets: LogBucket[];
  label?: string;
}) {
  if (!buckets.length) return null;
  const totals = buckets.map(
    (bucket) => bucket.counts.info + bucket.counts.warn + bucket.counts.error,
  );
  const ceiling = niceCeil(Math.max(...totals, 1));
  const step = W / buckets.length;
  const first = buckets[0];
  const last = buckets.at(-1);

  return (
    <div>
      <svg
        aria-label={label}
        className="h-20 w-full"
        preserveAspectRatio="none"
        role="img"
        viewBox={`0 0 ${W} ${H}`}
      >
        {buckets.map((bucket, index) => {
          let y = H;
          return (
            <g key={bucket.start}>
              {LAYERS.map((layer) => {
                const height = (bucket.counts[layer.level] / ceiling) * H;
                y -= height;
                return height > 0 ? (
                  <rect
                    className={layer.className}
                    height={height}
                    key={layer.level}
                    width={step * 0.7}
                    x={index * step + step * 0.15}
                    y={y}
                  />
                ) : null;
              })}
            </g>
          );
        })}
      </svg>
      <div className="mt-1.5 flex justify-between font-geist-mono text-[10px] text-muted-foreground/70">
        <span>{first ? `${TIME.format(first.start)} UTC` : ""}</span>
        <span>{last ? `${TIME.format(last.end)} UTC` : ""}</span>
      </div>
    </div>
  );
}
