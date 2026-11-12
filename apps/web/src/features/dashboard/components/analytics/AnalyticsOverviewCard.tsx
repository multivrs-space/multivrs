import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import {
  formatCompact,
  formatPercent,
  percentChange,
  pointChange,
} from "@/components/dashboard/lib/format";
import { Metric } from "@/components/dashboard/Metric";
import { LiveUsersRound } from "@/components/icons/animated";
import type { PlatformAnalytics } from "@/features/dashboard/types/analytics.types";

const RANGE_LABELS = { "24h": "24 hours", "7d": "7 days", "30d": "30 days" };

/** Visitors, page views and bounce rate, each against the previous period. */
export function AnalyticsOverviewCard({
  data,
  className,
}: {
  data: PlatformAnalytics;
  className?: string;
}) {
  const previous = data.previous;
  return (
    <DashCard aria-label="Overview" className={className} tone="glass">
      <DashCardHeader
        description={`Last ${RANGE_LABELS[data.range]} vs the ${RANGE_LABELS[data.range]} before`}
        icon={LiveUsersRound}
        title="Overview"
      />
      <div className="grid grid-cols-1 gap-6 p-5 pt-6 sm:grid-cols-3 sm:gap-4">
        <Metric
          delta={percentChange(data.visitors, previous?.visitors)}
          label="Unique visitors"
          size="md"
          value={formatCompact(data.visitors)}
        />
        <Metric
          delta={percentChange(data.pageviews, previous?.pageviews)}
          label="Page views"
          size="md"
          value={formatCompact(data.pageviews)}
        />
        <Metric
          delta={pointChange(data.bounceRate, previous?.bounceRate)}
          deltaUnit="pt"
          invert
          label="Bounce rate"
          size="md"
          value={formatPercent(data.bounceRate, 0)}
        />
      </div>
    </DashCard>
  );
}
