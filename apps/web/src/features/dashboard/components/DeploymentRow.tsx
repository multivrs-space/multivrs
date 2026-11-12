"use client";

import Link from "next/link";
import { StatusOrb } from "@/components/dashboard/StatusOrb";
import { LiveGitBranch } from "@/components/icons/animated";
import { DeploymentActions } from "@/features/dashboard/components/DeploymentActions";
import type { DashboardDeployment } from "@/features/dashboard/components/DeploymentsPage";
import { CreatedBy } from "@/features/dashboard/components/deployments/CreatedBy";
import { LiveElapsed } from "@/features/dashboard/components/deployments/LiveElapsed";
import { TargetPill } from "@/features/dashboard/components/deployments/TargetPill";
import { deploymentTone } from "@/features/dashboard/lib/deployment-groups";
import {
  fullTimestamp,
  relativeTime,
} from "@/features/dashboard/lib/relative-time";
import { cn } from "@/lib/utils";

const STATUS_TEXT: Partial<Record<DashboardDeployment["status"], string>> = {
  Ready: "text-emerald-700 dark:text-emerald-300",
  Building: "text-amber-700 dark:text-amber-300",
  Failed: "text-rose-700 dark:text-rose-300",
};
const CELL = "min-w-0 lg:order-none lg:basis-auto";

/**
 * One deployment as a row: which one and where it went, how it went, what
 * it shipped, and when. Phones stack it into three lines.
 */
export function DeploymentRow({
  deployment: d,
  workspace = false,
}: {
  deployment: DashboardDeployment;
  /** Rows mix projects, so each names its project. */
  workspace?: boolean;
}) {
  const running = d.status === "Building" || d.status === "Queued";
  const host = d.url.replace(/^https?:\/\//, "");
  return (
    <div className="group relative flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-tile px-3 py-3 transition-colors hover:bg-foreground/[0.03] lg:grid lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)_minmax(0,1.1fr)_5.5rem_2rem] lg:gap-x-4">
      <div className={cn(CELL, "order-1 flex-1")}>
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <Link
            className="font-geist-mono text-[13px] font-medium text-foreground outline-none after:absolute after:inset-0 after:rounded-tile focus-visible:after:ring-2 focus-visible:after:ring-ring"
            href={d.detailsUrl}
          >
            {d.id.slice(0, 8)}
          </Link>
          <TargetPill current={d.current} target={d.target} />
        </div>
        <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
          {workspace ? (
            <span className="text-foreground/80">{d.project} · </span>
          ) : null}
          {host ? (
            <a
              className="relative z-10 transition-colors hover:text-foreground"
              href={d.url}
              rel="noreferrer"
              target="_blank"
            >
              {host}
            </a>
          ) : (
            "No address yet"
          )}
        </p>
      </div>
      <div className={cn(CELL, "order-4 basis-full")}>
        <p className="flex items-center gap-2 text-[12.5px] font-medium">
          <StatusOrb label={d.status} tone={deploymentTone(d.status)} />
          <span className={STATUS_TEXT[d.status] ?? "text-muted-foreground"}>
            {d.status}
          </span>
          <span className="font-geist-mono text-[11px] font-normal text-muted-foreground">
            {running && d.startedAt ? (
              <LiveElapsed since={d.startedAt} />
            ) : (
              d.duration
            )}
          </span>
        </p>
        {d.status === "Failed" && d.errorMessage ? (
          <p className="mt-0.5 truncate font-geist-mono text-[11px] text-rose-700/80 dark:text-rose-300/70">
            {d.errorMessage}
          </p>
        ) : null}
      </div>
      <div
        className={cn(
          CELL,
          "order-5 flex basis-full flex-wrap gap-x-3 font-geist-mono text-[11.5px] text-muted-foreground lg:block",
        )}
      >
        <p className="flex min-w-0 items-center gap-1.5">
          <LiveGitBranch className="size-3 shrink-0" strokeWidth={2} />
          <span className="truncate">{d.branch}</span>
        </p>
        <p className="flex min-w-0 items-center gap-2 lg:mt-0.5">
          {d.commitSha && d.commitUrl ? (
            <a
              className="relative z-10 underline-offset-2 transition-colors hover:text-foreground hover:underline"
              href={d.commitUrl}
              rel="noreferrer"
              target="_blank"
            >
              {d.commitSha}
            </a>
          ) : (
            <span>{d.commitSha ?? "Uploaded"}</span>
          )}
          {d.commitMessage ? (
            <span className="truncate font-sans">{d.commitMessage}</span>
          ) : null}
          {d.renderMode ? (
            <span className="rounded-full bg-foreground/6 px-1.5 text-[10px] uppercase">
              {d.renderMode}
            </span>
          ) : null}
        </p>
      </div>
      <span
        className={cn(
          CELL,
          "order-2 flex shrink-0 flex-col items-end gap-0.5 text-right text-[11px] text-muted-foreground",
        )}
      >
        <time
          className="font-geist-mono"
          dateTime={d.createdAt}
          title={fullTimestamp(d.createdAt)}
        >
          {relativeTime(d.createdAt)}
        </time>
        <CreatedBy className="max-w-36" creator={d.createdBy} />
      </span>
      <div className={cn(CELL, "order-3 shrink-0")}>
        <DeploymentActions deployment={d} />
      </div>
      {running ? (
        <span
          aria-hidden="true"
          className="absolute inset-x-3 bottom-0 h-px overflow-hidden rounded-full bg-amber-500/15"
        >
          <span className="block h-full w-1/3 animate-[deploy-progress_1.6s_ease-in-out_infinite] bg-amber-500/70 motion-reduce:animate-none" />
        </span>
      ) : null}
    </div>
  );
}
