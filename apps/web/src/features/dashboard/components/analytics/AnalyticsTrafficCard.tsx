import { TrafficChart } from "@/components/dashboard/charts/TrafficChart";
import {
  DashCard,
  DashCardHeader,
  DashCardInsight,
} from "@/components/dashboard/DashCard";
import { LiveChartColumn, LiveSparkles } from "@/components/icons/animated";
import {
  peakInsight,
  trafficBuckets,
} from "@/features/dashboard/lib/analytics-insights";
import type { AnalyticsPoint } from "@/features/dashboard/types/analytics.types";

interface AnalyticsTrafficCardProps {
  series: AnalyticsPoint[];
  className?: string;
}

/** Volume per period as bars, with the error rate traced over them. */
export function AnalyticsTrafficCard({
  series,
  className,
}: AnalyticsTrafficCardProps) {
  const { buckets, valueLabel } = trafficBuckets(series);
  const insight = peakInsight(buckets, valueLabel);

  return (
    <DashCard aria-label="Traffic" className={className}>
      <DashCardHeader
        action={
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-[3px] bg-foreground/25" />
              {valueLabel}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 rounded-full bg-foreground/70" />
              Error rate
            </span>
          </div>
        }
        icon={LiveChartColumn}
        title="Traffic"
      />
      {buckets.length ? (
        <TrafficChart
          buckets={buckets}
          className="h-64 px-5 pt-6"
          rateLabel="Error rate"
          valueLabel={valueLabel}
        />
      ) : (
        <p className="px-5 py-16 text-center text-sm text-muted-foreground">
          No traffic in this period yet.
        </p>
      )}
      {insight ? (
        <DashCardInsight icon={LiveSparkles} label="Reading">
          {insight}
        </DashCardInsight>
      ) : (
        <div className="h-4" />
      )}
    </DashCard>
  );
}
