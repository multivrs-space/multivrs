import { CardAction } from "@/components/dashboard/CardAction";
import { SegmentedGauge } from "@/components/dashboard/charts/SegmentedGauge";
import {
  DashCard,
  DashCardHeader,
  DashCardInsight,
} from "@/components/dashboard/DashCard";
import { formatWhole } from "@/components/dashboard/lib/format";
import { StatusOrb } from "@/components/dashboard/StatusOrb";
import { LiveRocket, LiveSparkles } from "@/components/icons/animated";
import { overviewViewer } from "@/features/dashboard/components/overview/overview-data";
import { deploySuccessRate } from "@/features/dashboard/lib/overview-insights";
import type { DeployStats } from "@/features/dashboard/types/overview.types";
import { workspaceDeployStats } from "@/lib/services/workspace-overview.service";

/** How often a deploy goes live, with the last 30 days by outcome. */
export async function OverviewDeployHealthCard({
  username: workspace,
  className,
}: {
  /** The workspace slug from the route's params, awaited inside this card's Suspense. */
  username: Promise<string>;
  className?: string;
}) {
  const username = await workspace;
  const { userId } = await overviewViewer(username);
  return (
    <OverviewDeployHealthView
      className={className}
      stats={await workspaceDeployStats(userId, username)}
      username={username}
    />
  );
}

export function OverviewDeployHealthView({
  username,
  stats,
  className,
}: {
  username: string;
  stats: DeployStats;
  className?: string;
}) {
  const rate = deploySuccessRate(stats);
  const rows = [
    { label: "Live", value: stats.ready, tone: "ready" as const },
    { label: "Failed", value: stats.failed, tone: "error" as const },
    { label: "Building", value: stats.building, tone: "building" as const },
  ];
  const note =
    rate === null
      ? "Nothing finished building in the last 30 days."
      : stats.failed === 0
        ? "Every finished deploy went live."
        : `${stats.failed} of ${stats.ready + stats.failed} finished deploys failed. Their build logs say why.`;
  return (
    <DashCard aria-label="Deploy health" className={className}>
      <DashCardHeader
        action={
          <CardAction
            href={`/${username}/~/deployments`}
            label="Open deployments"
          />
        }
        description="Last 30 days"
        icon={LiveRocket}
        title="Deploy health"
      />
      <SegmentedGauge
        caption="Went live"
        className="mt-4 max-w-[280px]"
        format={(value) => `${Math.round(value)}%`}
        label="Deploys that went live"
        value={rate}
      />
      <dl className="grid grid-cols-3 gap-2 px-5 pb-4 pt-3">
        {rows.map((row) => (
          <div
            className="surface-inset rounded-tile px-3 py-2.5"
            key={row.label}
          >
            <dt className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
              <StatusOrb
                label={row.label}
                tone={row.value ? row.tone : "idle"}
              />
              {row.label}
            </dt>
            <dd className="figure mt-1.5 text-[19px] font-semibold leading-none">
              {formatWhole(row.value)}
            </dd>
          </div>
        ))}
      </dl>
      <DashCardInsight icon={LiveSparkles} label="Reading">
        {note}
      </DashCardInsight>
    </DashCard>
  );
}
