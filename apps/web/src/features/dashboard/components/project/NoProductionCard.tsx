import Link from "next/link";
import { DashCard } from "@/components/dashboard/DashCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatusOrb } from "@/components/dashboard/StatusOrb";
import { LiveRocket, LiveTriangleAlert } from "@/components/icons/animated";
import { buttonVariants } from "@/components/ui/button-variants";
import { LiveElapsed } from "@/features/dashboard/components/deployments/LiveElapsed";
import { RedeployButton } from "@/features/dashboard/components/deployments/RedeployButton";
import type { ProjectOverviewData } from "@/features/dashboard/types/project-overview.types";

/** Before anything is live: the first build running, failed, or not started. */
export function NoProductionCard({
  base,
  data,
}: {
  base: string;
  data: ProjectOverviewData;
  username: string;
}) {
  const latest = data.recentDeployments[0];
  if (!latest)
    return (
      <DashCard aria-label="Production deployment">
        <EmptyState
          description={
            data.repositoryUrl
              ? "Push to the repository and the first build starts on its own."
              : "Connect a repository in Settings, or deploy from the command line."
          }
          glyph={LiveRocket}
          title="Nothing is live yet"
        />
      </DashCard>
    );
  const running = latest.status === "queued" || latest.status === "building";
  const href = `${base}/deployments/${latest.id}`;
  return (
    <DashCard aria-label="Production deployment" className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3" data-icon-trigger>
          <span
            className={
              running
                ? "grid size-10 shrink-0 place-items-center rounded-tile border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300"
                : "grid size-10 shrink-0 place-items-center rounded-tile border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300"
            }
            data-icon-loop={running ? "" : undefined}
          >
            {running ? (
              <LiveRocket className="size-5" strokeWidth={1.75} />
            ) : (
              <LiveTriangleAlert className="size-5" strokeWidth={1.75} />
            )}
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.015em]">
              {running
                ? "The first build is running"
                : "The last build didn't go live"}
              <StatusOrb
                label={running ? "Building" : "Failed"}
                pill
                tone={running ? "building" : "error"}
              />
            </p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {running ? (
                <>
                  {latest.branch} · <LiveElapsed since={latest.createdAt} /> so
                  far. This page updates on its own.
                </>
              ) : (
                (latest.errorMessage ??
                "The build stopped. Its log shows where.")
              )}
            </p>
          </div>
        </div>
        <span className="flex items-center gap-2">
          {!running && data.repositoryUrl ? (
            <RedeployButton
              source={{
                projectId: data.id,
                deploymentId: latest.id,
                branch: latest.branch,
                target: latest.target,
                deploymentsHref: `${base}/deployments`,
              }}
            />
          ) : null}
          <Link
            className={buttonVariants({
              size: "sm",
              variant: running ? "hero" : "raised",
            })}
            href={href}
          >
            {running ? "Watch it build" : "Open the build log"}
          </Link>
        </span>
      </div>
    </DashCard>
  );
}
