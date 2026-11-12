import Link from "next/link";
import { DashCard } from "@/components/dashboard/DashCard";
import { formatPercent } from "@/components/dashboard/lib/format";
import { LiveArrowUpRight, LiveSparkles } from "@/components/icons/animated";
import {
  overviewProjects,
  overviewUsage,
  overviewViewer,
} from "@/features/dashboard/components/overview/overview-data";
import { peakSlot } from "@/features/dashboard/lib/overview-heat";
import {
  deploySuccessRate,
  type Headline,
  headline,
  weekOverWeek,
} from "@/features/dashboard/lib/overview-insights";
import type {
  DeployStats,
  TrafficHeat,
} from "@/features/dashboard/types/overview.types";
import type { DashboardProject } from "@/features/dashboard/types/project.types";
import type { AccountUsage } from "@/features/dashboard/types/usage.types";
import {
  workspaceDeployStats,
  workspaceTrafficHeat,
} from "@/lib/services/workspace-overview.service";
import { cn } from "@/lib/utils";

const SEGMENTS = 12;

/** Where the insight's button goes, by what the insight is about. */
function nextStep(next: Headline["next"], username: string) {
  const base = `/${username}/~`;
  if (next === "failed-deploys")
    return { label: "See the failed deploys", href: `${base}/deployments` };
  if (next === "usage")
    return { label: "Open usage", href: `${base}/projects?view=usage` };
  if (next === "deployments")
    return { label: "Open deployments", href: `${base}/deployments` };
  return { label: "Start a project", href: `/${username}/new` };
}

/** The page's one purple card: the single most useful thing to know right now. */
export async function OverviewInsightCard({
  username: workspace,
  className,
}: {
  /** The workspace slug from the route's params, awaited inside this card's Suspense. */
  username: Promise<string>;
  className?: string;
}) {
  const username = await workspace;
  const { userId } = await overviewViewer(username);
  const [usage, deploys, heat, projects] = await Promise.all([
    overviewUsage(username),
    workspaceDeployStats(userId, username),
    workspaceTrafficHeat(userId, username),
    overviewProjects(username),
  ]);
  return (
    <OverviewInsightView
      className={className}
      username={username}
      deploys={deploys}
      heat={heat}
      projects={projects}
      usage={usage}
    />
  );
}

export function OverviewInsightView({
  username,
  usage,
  deploys,
  heat,
  projects,
  className,
}: {
  username: string;
  usage: AccountUsage;
  deploys: DeployStats;
  heat: TrafficHeat | null;
  projects: DashboardProject[];
  className?: string;
}) {
  const failing = projects.filter(
    (project) => project.status === "error",
  ).length;
  const line = headline({
    failing,
    traffic: weekOverWeek(usage.series),
    deploys,
    peak: heat ? peakSlot(heat) : null,
  });
  const rate = deploySuccessRate(deploys);
  const lit = rate === null ? 0 : Math.round((rate / 100) * SEGMENTS);
  return (
    <DashCard aria-label="Insight" className={className} tone="hero">
      <div className="relative flex h-full flex-col p-5" data-icon-trigger>
        <span className="flex w-fit items-center gap-1.5 rounded-full bg-primary-foreground/15 px-2.5 py-1 text-[11.5px] font-medium ring-1 ring-primary-foreground/25 ring-inset">
          <LiveSparkles className="size-3.5" strokeWidth={1.75} />
          Insight
        </span>
        <p className="mt-6 text-[24px] font-medium leading-[1.25] tracking-[-0.02em] text-balance">
          {line.lead ? `${line.lead} ` : null}
          <span className="rounded-full bg-primary-foreground px-2 text-primary">
            {line.figure}
          </span>{" "}
          {line.tail}
        </p>
        <Link
          className="mt-4 flex w-fit items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1.5 text-[12.5px] font-medium ring-1 ring-primary-foreground/25 ring-inset transition-colors hover:bg-primary-foreground/25"
          data-icon-trigger
          href={nextStep(line.next, username).href}
        >
          {nextStep(line.next, username).label}
          <LiveArrowUpRight className="size-3.5" strokeWidth={2} />
        </Link>
        <div className="mt-auto pt-6">
          <p className="mb-2 flex justify-between gap-2 text-[11.5px] opacity-75">
            <span>
              {rate === null
                ? "No finished deploys in 30 days"
                : "Deploys that went live, last 30 days"}
            </span>
            {rate === null ? null : (
              <span className="figure font-semibold">
                {formatPercent(rate, 0)}
              </span>
            )}
          </p>
          <div aria-hidden="true" className="flex gap-1">
            {Array.from({ length: SEGMENTS }, (_, index) => index).map(
              (index) => (
                <span
                  className={cn(
                    "h-4 flex-1 rounded-[5px]",
                    index < lit
                      ? "bg-primary-foreground"
                      : "bg-primary-foreground/20",
                  )}
                  key={index}
                />
              ),
            )}
          </div>
        </div>
      </div>
    </DashCard>
  );
}
