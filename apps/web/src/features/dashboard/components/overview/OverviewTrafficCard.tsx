import { CardAction } from "@/components/dashboard/CardAction";
import { TrafficChart } from "@/components/dashboard/charts/TrafficChart";
import {
  DashCard,
  DashCardHeader,
  DashCardInsight,
} from "@/components/dashboard/DashCard";
import { formatCompact } from "@/components/dashboard/lib/format";
import { LiveChartColumn, LiveSparkles } from "@/components/icons/animated";
import { OverviewTrafficEmpty } from "@/features/dashboard/components/overview/OverviewTrafficEmpty";
import {
  overviewProjects,
  overviewUsage,
} from "@/features/dashboard/components/overview/overview-data";
import { dailyRequests } from "@/features/dashboard/lib/overview-insights";
import type { DashboardProject } from "@/features/dashboard/types/project.types";
import type { AccountUsage } from "@/features/dashboard/types/usage.types";

/** Requests per day across every project, the busiest day called out. */
export async function OverviewTrafficCard({
  username: workspace,
  className,
}: {
  /** The workspace slug from the route's params, awaited inside this card's Suspense. */
  username: Promise<string>;
  className?: string;
}) {
  const username = await workspace;
  const [projects, usage] = await Promise.all([
    overviewProjects(username),
    overviewUsage(username),
  ]);
  return (
    <OverviewTrafficView
      className={className}
      projects={projects}
      usage={usage}
      username={username}
    />
  );
}

export function OverviewTrafficView({
  username,
  usage,
  projects,
  className,
}: {
  username: string;
  usage: AccountUsage;
  projects: DashboardProject[];
  className?: string;
}) {
  const buckets = dailyRequests(usage.series);
  const peak = buckets.reduce(
    (best, bucket) => (bucket.value > best.value ? bucket : best),
    { label: "", value: 0 },
  );
  return (
    <DashCard aria-label="Traffic" className={className}>
      <DashCardHeader
        action={
          <CardAction
            href={`/${username}/~/projects?view=usage`}
            label="Open usage"
          />
        }
        description={
          usage.state === "ready"
            ? `${formatCompact(usage.requests)} requests across every project`
            : "Requests across every project"
        }
        icon={LiveChartColumn}
        title="Traffic"
      />
      {usage.state === "ready" && peak.value > 0 ? (
        <>
          <TrafficChart
            buckets={buckets}
            className="h-64 px-5 pt-6"
            valueLabel="Requests"
          />
          <DashCardInsight icon={LiveSparkles} label="Reading">
            {peak.label} was the busiest day, with {formatCompact(peak.value)}{" "}
            requests.
          </DashCardInsight>
        </>
      ) : (
        <OverviewTrafficEmpty
          live={projects.filter((project) => project.status === "ready").length}
          state={usage.state}
          total={projects.length}
          username={username}
        />
      )}
    </DashCard>
  );
}
