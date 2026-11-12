import {
  SkeletonCard,
  SkeletonRows,
} from "@/components/dashboard/SkeletonCard";
import {
  OVERVIEW_HEIGHTS as H,
  OVERVIEW_SLOTS as S,
} from "@/features/dashboard/components/overview/overview-layout";
import { PageBody } from "@/features/dashboard/components/PageBody";
import { cn } from "@/lib/utils";

const KPIS = ["requests", "deploys", "emails", "projects"];
/** Fourteen bar heights, a calm rising shape; keyed by day so React keys stay stable. */
const BARS = [38, 52, 61, 66, 64, 58, 49, 44, 41, 47, 55, 63, 70, 74].map(
  (height, day) => ({ day: `d${day}`, height }),
);
const HEAT_ROWS = ["a", "b", "c", "d", "e", "f", "g", "h"];
const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

/** Eyebrow, greeting and line, with Compose and New project on the right. */
export function OverviewHeaderSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-wrap items-end justify-between gap-4"
    >
      <div className="space-y-2.5">
        <span className="skeleton block h-2.5 w-36" />
        <span className="skeleton block h-8 w-72 max-w-full" />
        <span className="skeleton block h-3 w-96 max-w-full" />
      </div>
      <div className="flex gap-2">
        <span className="skeleton h-9 w-28 rounded-full" />
        <span className="skeleton h-9 w-32 rounded-full" />
      </div>
    </div>
  );
}

export function OverviewKpisSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {KPIS.map((kpi) => (
        <SkeletonCard className={H.kpi} key={kpi}>
          <span className="skeleton mt-2 block h-8 w-20" />
          <span className="skeleton mt-4 block h-3 w-28" />
        </SkeletonCard>
      ))}
    </div>
  );
}

/** Daily bars rising from a baseline, like the traffic chart. */
export function OverviewTrafficSkeleton() {
  return (
    <SkeletonCard className={cn(S.traffic, H.traffic)}>
      <div className="flex h-56 items-end gap-2 pt-6">
        {BARS.map((bar) => (
          <span
            className="skeleton flex-1 rounded-[6px]"
            key={bar.day}
            style={{ height: `${bar.height}%` }}
          />
        ))}
      </div>
    </SkeletonCard>
  );
}

/** The purple insight card, its sentence and segment bar as soft shapes. */
export function OverviewInsightSkeleton() {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex flex-col rounded-card bg-primary/15 p-5 ring-1 ring-primary/20 ring-inset",
        S.insight,
        H.traffic,
      )}
    >
      <span className="h-6 w-20 rounded-full bg-primary/20" />
      <span className="mt-6 h-6 w-4/5 rounded-full bg-primary/20" />
      <span className="mt-2.5 h-6 w-3/5 rounded-full bg-primary/20" />
      <span className="mt-auto h-4 w-full rounded-[5px] bg-primary/20" />
    </div>
  );
}

/** Eight time rows by seven days, the heatmap's grid. */
export function OverviewHeatSkeleton() {
  return (
    <SkeletonCard className={cn(S.heat, H.heat)}>
      <div className="space-y-1.5 pl-12">
        {HEAT_ROWS.map((row) => (
          <div className="grid grid-cols-7 gap-1.5" key={row}>
            {DAYS.map((day) => (
              <span className="skeleton h-7 rounded-[7px]" key={day} />
            ))}
          </div>
        ))}
      </div>
    </SkeletonCard>
  );
}

/** The deploy-health arc and its three outcome tiles. */
export function OverviewDeploySkeleton() {
  return (
    <SkeletonCard className={cn(S.deploys, H.heat)}>
      <div className="mx-auto mt-4 aspect-[240/130] w-full max-w-[260px] rounded-t-full border-[22px] border-b-0 border-foreground/[0.06]" />
      <div className="mt-6 grid grid-cols-3 gap-2">
        {DAYS.slice(0, 3).map((day) => (
          <span className="skeleton h-16 rounded-tile" key={day} />
        ))}
      </div>
    </SkeletonCard>
  );
}

export function OverviewListSkeleton({
  slot,
  rows,
}: {
  slot: "recent" | "stack";
  rows: number;
}) {
  return (
    <SkeletonCard className={cn(S[slot], H.recent)}>
      <SkeletonRows rows={rows} />
    </SkeletonCard>
  );
}

/** The whole overview while the shell itself is still loading. */
export function OverviewPageSkeleton() {
  return (
    <PageBody>
      <main aria-busy aria-label="Loading overview" className="space-y-5">
        <OverviewHeaderSkeleton />
        <OverviewKpisSkeleton />
        <div className="grid gap-3 lg:grid-cols-12">
          <OverviewTrafficSkeleton />
          <OverviewInsightSkeleton />
          <OverviewHeatSkeleton />
          <OverviewDeploySkeleton />
          <OverviewListSkeleton rows={5} slot="recent" />
          <OverviewListSkeleton rows={4} slot="stack" />
        </div>
      </main>
    </PageBody>
  );
}
