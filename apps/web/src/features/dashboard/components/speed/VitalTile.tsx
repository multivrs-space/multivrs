import { SegmentBar } from "@/components/dashboard/charts/SegmentBar";
import { TONE_CLASSES } from "@/components/dashboard/DeltaPill";
import type { AnimatedIcon } from "@/components/icons/animated";
import {
  formatVital,
  RATING_LABELS,
  type VitalName,
  type VitalRating,
  vitalRating,
} from "@/features/dashboard/lib/web-vitals";
import type { WebVitalMetric } from "@/features/dashboard/types/analytics.types";
import { cn } from "@/lib/utils";

const RATING_TONE: Record<VitalRating, keyof typeof TONE_CLASSES> = {
  good: "positive",
  "needs-improvement": "neutral",
  poor: "negative",
};

interface VitalTileProps {
  name: VitalName;
  description: string;
  icon: AnimatedIcon;
  metric: WebVitalMetric | undefined;
}

/** One Core Web Vital: its p75 value, rating, and how many visits were good. */
export function VitalTile({
  name,
  description,
  icon: Icon,
  metric,
}: VitalTileProps) {
  const rating = metric ? vitalRating(name, metric.value) : null;
  return (
    <article
      className="surface-card flex flex-col rounded-card p-4"
      data-dash-card
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <span
            className="surface-inset grid size-8 place-items-center rounded-[9px] text-muted-foreground"
            data-card-icon
          >
            <Icon className="size-4" strokeWidth={1.75} />
          </span>
          <span>
            <span className="block font-geist-mono text-[11px] font-semibold tracking-wider">
              {name}
            </span>
            <span className="block text-[11px] text-muted-foreground">
              {description}
            </span>
          </span>
        </span>
        {rating ? (
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-[10.5px] font-semibold",
              TONE_CLASSES[RATING_TONE[rating]],
            )}
          >
            {RATING_LABELS[rating]}
          </span>
        ) : null}
      </div>
      <p className="figure mt-5 text-[30px] font-semibold leading-none">
        {formatVital(name, metric?.value)}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">75th percentile</p>
      <div className="mt-auto pt-5">
        <SegmentBar
          label={`${name} good visits`}
          value={metric?.goodRate ?? 0}
        />
        <p className="mt-2 flex justify-between font-geist-mono text-[10px] text-muted-foreground">
          <span>
            {metric
              ? `${Math.round(metric.goodRate)}% good`
              : "Waiting for visits"}
          </span>
          <span>
            {metric ? `${metric.samples.toLocaleString("en")} samples` : ""}
          </span>
        </p>
      </div>
    </article>
  );
}
