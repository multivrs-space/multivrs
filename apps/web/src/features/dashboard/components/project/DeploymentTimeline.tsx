import Link from "next/link";
import { CardAction } from "@/components/dashboard/CardAction";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { StatusOrb } from "@/components/dashboard/StatusOrb";
import { LiveGitBranch, LiveHistory } from "@/components/icons/animated";
import { deploymentStatus } from "@/features/dashboard/lib/deployment-status";
import { relativeTime } from "@/features/dashboard/lib/relative-time";
import type { ProjectOverviewData } from "@/features/dashboard/types/project-overview.types";
import { cn } from "@/lib/utils";

/** Recent deployments as a connected history, newest first. */
export function DeploymentTimeline({
  base,
  data,
}: {
  base: string;
  data: ProjectOverviewData;
}) {
  const productionId = data.production?.id;
  return (
    <DashCard aria-label="Deployment history">
      <DashCardHeader
        action={
          <CardAction href={`${base}/deployments`} label="All deployments" />
        }
        icon={LiveHistory}
        title="History"
      />
      {data.recentDeployments.length ? (
        <ol className="relative p-3 pt-4">
          <span
            aria-hidden="true"
            className="absolute bottom-8 left-[23px] top-8 w-px bg-hairline-strong"
          />
          {data.recentDeployments.slice(0, 6).map((item) => {
            const status = deploymentStatus(item.status);
            return (
              <li className="relative" key={item.id}>
                <Link
                  className="group flex gap-3.5 rounded-tile px-2 py-2.5 transition-colors hover:bg-foreground/[0.03]"
                  data-icon-trigger
                  href={`${base}/deployments/${item.id}`}
                >
                  <span className="relative z-10 mt-1 grid size-4 shrink-0 place-items-center rounded-full bg-ink">
                    <StatusOrb label={status.label} tone={status.tone} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-geist-mono text-xs">
                        {item.id.slice(0, 8)}
                      </span>
                      {item.id === productionId ? (
                        <span className="rounded-full bg-primary/12 px-1.5 py-px text-[10px] font-medium text-primary">
                          Production
                        </span>
                      ) : null}
                      <span
                        className={cn(
                          "ml-auto text-[11px] font-medium",
                          status.text,
                        )}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 truncate text-[11px] text-muted-foreground">
                      <LiveGitBranch
                        className="size-3 shrink-0"
                        strokeWidth={2}
                      />
                      {item.branch}
                      {item.commitSha ? ` · ${item.commitSha.slice(0, 7)}` : ""}{" "}
                      · {relativeTime(item.createdAt)}
                    </p>
                    {item.status === "error" && item.errorMessage ? (
                      <p className="mt-1.5 line-clamp-1 font-geist-mono text-[11px] text-rose-700/80 dark:text-rose-300/70">
                        {item.errorMessage}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="px-5 py-10 text-center text-[13px] text-muted-foreground">
          Deployments appear here after the first push.
        </p>
      )}
    </DashCard>
  );
}
