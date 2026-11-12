import Link from "next/link";
import { CardAction } from "@/components/dashboard/CardAction";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatusOrb } from "@/components/dashboard/StatusOrb";
import {
  LiveGitBranch,
  LiveHistory,
  LivePlus,
  LiveRocket,
} from "@/components/icons/animated";
import { buttonVariants } from "@/components/ui/button-variants";
import type { DashboardDeployment } from "@/features/dashboard/components/DeploymentsPage";
import { overviewDeployments } from "@/features/dashboard/components/overview/overview-data";
import { deploymentTone } from "@/features/dashboard/lib/deployment-groups";
import { relativeTime } from "@/features/dashboard/lib/relative-time";

/** The latest builds across every project, each opening its own page. */
export async function OverviewRecentDeploys({
  username: workspace,
  className,
}: {
  /** The workspace slug from the route's params, awaited inside this card's Suspense. */
  username: Promise<string>;
  className?: string;
}) {
  const username = await workspace;
  return (
    <OverviewRecentDeploysView
      className={className}
      deployments={(await overviewDeployments(username)).slice(0, 5)}
      username={username}
    />
  );
}

export function OverviewRecentDeploysView({
  username,
  deployments,
  className,
}: {
  username: string;
  deployments: DashboardDeployment[];
  className?: string;
}) {
  return (
    <DashCard aria-label="Recent deploys" className={className}>
      <DashCardHeader
        action={
          <CardAction
            href={`/${username}/~/deployments`}
            label="See every deploy"
          />
        }
        description="Across every project"
        icon={LiveHistory}
        title="Recent deploys"
      />
      {deployments.length ? (
        <ul className="p-2 pt-3">
          {deployments.map((deployment) => (
            <li key={deployment.id}>
              <Link
                className="flex items-center gap-3 rounded-tile px-3 py-2.5 outline-none transition-colors hover:bg-foreground/[0.03] focus-visible:ring-2 focus-visible:ring-ring"
                data-icon-trigger
                href={deployment.detailsUrl}
              >
                <span className="surface-inset grid size-9 shrink-0 place-items-center rounded-tile text-muted-foreground">
                  <LiveRocket className="size-4" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-[13.5px] font-medium text-foreground">
                      {deployment.project}
                    </span>
                    <span className="shrink-0 rounded-full border border-hairline px-1.5 text-[10.5px] text-muted-foreground">
                      {deployment.environment}
                    </span>
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 truncate font-geist-mono text-[11.5px] text-muted-foreground">
                    <LiveGitBranch
                      className="size-3 shrink-0"
                      strokeWidth={1.75}
                    />
                    {deployment.branch} · {deployment.commitSha}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <StatusOrb
                    label={deployment.status}
                    pill
                    tone={deploymentTone(deployment.status)}
                  />
                  <span className="text-[11px] text-muted-foreground">
                    {relativeTime(deployment.createdAt)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          actions={
            <Link
              className={buttonVariants({ size: "sm", variant: "hero" })}
              data-icon-trigger
              href={`/${username}/new`}
            >
              <LivePlus strokeWidth={2} />
              New project
            </Link>
          }
          className="flex-1"
          description="Import a repository and every build shows up here as it runs."
          glyph={LiveRocket}
          title="No deploys yet"
        />
      )}
    </DashCard>
  );
}
