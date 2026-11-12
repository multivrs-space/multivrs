import Link from "next/link";
import { CardAction } from "@/components/dashboard/CardAction";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { StatusOrb } from "@/components/dashboard/StatusOrb";
import { LiveArrowUpRight, LiveGitBranch } from "@/components/icons/animated";
import { TargetPill } from "@/features/dashboard/components/deployments/TargetPill";
import { deploymentStatus } from "@/features/dashboard/lib/deployment-status";
import { relativeTime } from "@/features/dashboard/lib/relative-time";
import type {
  ProjectOverviewData,
  ProjectOverviewDeployment,
} from "@/features/dashboard/types/project-overview.types";

/** Newest deployment of each branch: what every line of work looks like now. */
export function latestPerBranch(
  deployments: readonly ProjectOverviewDeployment[],
): ProjectOverviewDeployment[] {
  const seen = new Map<string, ProjectOverviewDeployment>();
  for (const deployment of deployments) {
    if (!seen.has(deployment.branch)) seen.set(deployment.branch, deployment);
  }
  return [...seen.values()];
}

export function BranchesCard({
  base,
  data,
}: {
  base: string;
  data: ProjectOverviewData;
}) {
  const branches = latestPerBranch(data.recentDeployments).slice(0, 6);
  return (
    <DashCard aria-label="Branches">
      <DashCardHeader
        action={
          <CardAction href={`${base}/deployments`} label="All deployments" />
        }
        description={
          branches.length ? `${branches.length} with recent builds` : undefined
        }
        icon={LiveGitBranch}
        title="Branches"
      />
      {branches.length ? (
        <ul className="space-y-0.5 p-2 pt-3">
          {branches.map((item) => {
            const status = deploymentStatus(item.status);
            return (
              <li
                className="group flex items-center gap-3 rounded-tile px-3 py-2.5 transition-colors hover:bg-foreground/[0.03]"
                key={item.branch}
              >
                <StatusOrb label={status.label} tone={status.tone} />
                <Link
                  className="min-w-0 flex-1"
                  href={`${base}/deployments/${item.id}`}
                >
                  <span className="flex items-center gap-2">
                    <span className="truncate font-geist-mono text-[12.5px] text-foreground">
                      {item.branch}
                    </span>
                    <TargetPill
                      current={item.id === data.production?.id}
                      target={
                        item.target === "production" ? "Production" : "Preview"
                      }
                    />
                  </span>
                  <span className="mt-0.5 block truncate text-[11.5px] text-muted-foreground">
                    {status.label}
                    {item.commitSha ? ` · ${item.commitSha.slice(0, 7)}` : ""} ·{" "}
                    {relativeTime(item.createdAt)}
                  </span>
                </Link>
                {item.url && item.status === "ready" ? (
                  <a
                    aria-label={`Open ${item.branch}`}
                    className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                    data-icon-trigger
                    href={item.url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <LiveArrowUpRight className="size-3.5" strokeWidth={2} />
                  </a>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="px-5 py-10 text-center text-[13px] text-muted-foreground">
          Each branch you push shows up here with its own preview.
        </p>
      )}
    </DashCard>
  );
}
