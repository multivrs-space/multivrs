import { CardAction } from "@/components/dashboard/CardAction";
import { Sparkline } from "@/components/dashboard/charts/Sparkline";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { formatCompact } from "@/components/dashboard/lib/format";
import { LiveActivity } from "@/components/icons/animated";
import type { ProjectOverviewData } from "@/features/dashboard/types/project-overview.types";

/** Last 24 hours of traffic at a glance. */
export function ProjectPulseCard({
  base,
  data,
}: {
  base: string;
  data: ProjectOverviewData;
}) {
  const { analytics } = data;
  const stats = [
    { label: "Latency", value: `${Math.round(analytics.averageLatency)} ms` },
    { label: "Errors", value: `${analytics.errorRate.toFixed(2)}%` },
    { label: "Visitors", value: formatCompact(analytics.visitors) },
  ];
  return (
    <DashCard aria-label="Traffic pulse">
      <DashCardHeader
        action={
          <CardAction href={`${base}/analytics`} label="Open analytics" />
        }
        description="Last 24 hours"
        icon={LiveActivity}
        title="Pulse"
      />
      <p className="figure px-5 pt-4 text-[34px] font-semibold leading-none">
        {formatCompact(analytics.requests)}
        <span className="ml-1.5 text-xs font-normal tracking-normal text-muted-foreground">
          requests
        </span>
      </p>
      <Sparkline
        className="mt-3 h-14 w-full"
        label="Requests over the last 24 hours"
        values={analytics.series.map((point) => point.requests)}
      />
      <dl className="surface-inset m-2 grid grid-cols-3 gap-2 rounded-tile px-3 py-3">
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt className="text-[11px] text-muted-foreground">{stat.label}</dt>
            <dd className="figure mt-0.5 text-[14px] font-semibold">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </DashCard>
  );
}
