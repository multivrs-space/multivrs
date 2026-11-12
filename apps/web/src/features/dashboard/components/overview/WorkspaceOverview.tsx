import { Suspense } from "react";
import { OverviewDeployHealthCard } from "@/features/dashboard/components/overview/OverviewDeployHealthCard";
import { OverviewHeader } from "@/features/dashboard/components/overview/OverviewHeader";
import { OverviewHeatCard } from "@/features/dashboard/components/overview/OverviewHeatCard";
import { OverviewInsightCard } from "@/features/dashboard/components/overview/OverviewInsightCard";
import { OverviewKpis } from "@/features/dashboard/components/overview/OverviewKpis";
import { OverviewRecentDeploys } from "@/features/dashboard/components/overview/OverviewRecentDeploys";
import {
  OverviewDeploySkeleton,
  OverviewHeaderSkeleton,
  OverviewHeatSkeleton,
  OverviewInsightSkeleton,
  OverviewKpisSkeleton,
  OverviewListSkeleton,
  OverviewTrafficSkeleton,
} from "@/features/dashboard/components/overview/OverviewSkeletons";
import { OverviewStackCard } from "@/features/dashboard/components/overview/OverviewStackCard";
import { OverviewTrafficCard } from "@/features/dashboard/components/overview/OverviewTrafficCard";
import {
  OVERVIEW_HEIGHTS as H,
  OVERVIEW_SLOTS as S,
} from "@/features/dashboard/components/overview/overview-layout";
import { PageBody } from "@/features/dashboard/components/PageBody";
import { cn } from "@/lib/utils";

/**
 * The workspace home: every layer of the stack at a glance. Each card loads
 * on its own, so a slow source never holds up the rest.
 */
export function WorkspaceOverview({
  username,
}: {
  /** Resolved inside each card, so the page shell never waits on params. */
  username: Promise<string>;
}) {
  return (
    <PageBody>
      <Suspense fallback={<OverviewHeaderSkeleton />}>
        <OverviewHeader username={username} />
      </Suspense>
      <Suspense fallback={<OverviewKpisSkeleton />}>
        <OverviewKpis username={username} />
      </Suspense>
      <div className="grid gap-3 lg:grid-cols-12">
        <Suspense fallback={<OverviewTrafficSkeleton />}>
          <OverviewTrafficCard
            className={cn(S.traffic, H.traffic)}
            username={username}
          />
        </Suspense>
        <Suspense fallback={<OverviewInsightSkeleton />}>
          <OverviewInsightCard
            className={cn(S.insight, H.traffic)}
            username={username}
          />
        </Suspense>
        <Suspense fallback={<OverviewHeatSkeleton />}>
          <OverviewHeatCard
            className={cn(S.heat, H.heat)}
            username={username}
          />
        </Suspense>
        <Suspense fallback={<OverviewDeploySkeleton />}>
          <OverviewDeployHealthCard
            className={cn(S.deploys, H.heat)}
            username={username}
          />
        </Suspense>
        <Suspense fallback={<OverviewListSkeleton rows={5} slot="recent" />}>
          <OverviewRecentDeploys
            className={cn(S.recent, H.recent)}
            username={username}
          />
        </Suspense>
        <Suspense fallback={<OverviewListSkeleton rows={4} slot="stack" />}>
          <OverviewStackCard
            className={cn(S.stack, H.recent)}
            username={username}
          />
        </Suspense>
      </div>
    </PageBody>
  );
}
