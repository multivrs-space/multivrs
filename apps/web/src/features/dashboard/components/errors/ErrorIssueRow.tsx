"use client";

import Link from "next/link";
import { useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { Sparkline } from "@/components/dashboard/charts/Sparkline";
import { formatCompact } from "@/components/dashboard/lib/format";
import {
  fullTimestamp,
  relativeTime,
} from "@/features/dashboard/lib/relative-time";
import type { ErrorIssue } from "@/features/dashboard/types/error-issue.types";
import { cn } from "@/lib/utils";

/** One issue: what broke, where, how often lately, and its newest event. */
export function ErrorIssueRow({
  issue,
  projects,
  workspace,
}: {
  issue: ErrorIssue;
  projects: Map<string, { name: string; href: string }>;
  workspace: boolean;
}) {
  const [open, setOpen] = useState(false);
  const project = projects.get(issue.latest.projectId);
  return (
    <div className="border-b border-hairline last:border-b-0">
      <button
        aria-expanded={open}
        className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-4 py-3.5 text-left outline-none transition-colors hover:bg-foreground/[0.025] focus-visible:bg-foreground/[0.04] md:grid-cols-[minmax(0,1fr)_7rem_4.5rem_5.5rem]"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span className="min-w-0">
          <span className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 rounded-md bg-rose-500/10 px-1.5 py-px font-geist-mono text-[11px] font-medium text-rose-700 dark:text-rose-300">
              {issue.type}
            </span>
            <span className="truncate text-[13.5px] font-medium text-foreground">
              {issue.title}
            </span>
            {issue.isNew ? (
              <span className="shrink-0 rounded-full bg-primary/12 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-primary">
                New
              </span>
            ) : null}
          </span>
          <span className="mt-1 block truncate font-geist-mono text-[11px] text-muted-foreground">
            {workspace && project ? `${project.name} · ` : ""}
            {issue.deployments}{" "}
            {issue.deployments === 1 ? "deployment" : "deployments"} · first
            seen {relativeTime(issue.firstSeen)}
          </span>
        </span>
        <Sparkline
          className="hidden h-8 w-28 md:block"
          label={`${issue.title}: events per day, last 14 days`}
          tone="muted"
          values={issue.daily}
        />
        <span className="text-right">
          <span className="figure block text-[15px] font-semibold">
            {formatCompact(issue.count)}
          </span>
          <span className="block text-[10.5px] text-muted-foreground">
            events
          </span>
        </span>
        <time
          className="hidden text-right font-geist-mono text-[11px] text-muted-foreground md:block"
          dateTime={issue.lastSeen}
          title={fullTimestamp(issue.lastSeen)}
        >
          {relativeTime(issue.lastSeen)}
        </time>
      </button>
      {open ? (
        <div className="mx-3 mb-3 space-y-3 duration-200 animate-in fade-in-0 slide-in-from-top-1">
          <div className="surface-inset flex items-start gap-2 rounded-tile p-3">
            <pre className="min-w-0 flex-1 whitespace-pre-wrap break-words font-geist-mono text-[11.5px] leading-relaxed text-rose-800 dark:text-rose-200">
              {issue.latest.message}
            </pre>
            <CopyButton className="size-6" text={issue.latest.message} />
          </div>
          <dl className="grid gap-x-6 gap-y-1.5 px-1 font-geist-mono text-[11px] sm:grid-cols-[auto_1fr]">
            <dt className="text-muted-foreground">Latest</dt>
            <dd>{fullTimestamp(issue.latest.at)}</dd>
            <dt className="text-muted-foreground">Deployment</dt>
            <dd>
              {project ? (
                <Link
                  className="underline-offset-2 hover:underline"
                  href={`${project.href}/deployments/${issue.latest.deploymentId}`}
                >
                  {issue.latest.deploymentId.slice(0, 8)}
                </Link>
              ) : (
                issue.latest.deploymentId.slice(0, 8)
              )}
            </dd>
            {issue.latest.requestId ? (
              <>
                <dt className="text-muted-foreground">Request</dt>
                <dd className={cn("flex items-center gap-1")}>
                  {issue.latest.requestId}
                  <CopyButton
                    className="size-6"
                    text={issue.latest.requestId}
                  />
                </dd>
              </>
            ) : null}
          </dl>
        </div>
      ) : null}
    </div>
  );
}
