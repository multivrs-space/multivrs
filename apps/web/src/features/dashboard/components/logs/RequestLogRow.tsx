"use client";

import Link from "next/link";
import { useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { formatBytes } from "@/components/dashboard/lib/units";
import { statusClass } from "@/features/dashboard/lib/request-log-stats";
import type { RequestLogItem } from "@/features/dashboard/types/request-log.types";
import { cn } from "@/lib/utils";

const STATUS = {
  ok: "bg-foreground/6 text-muted-foreground",
  client: "bg-amber-500/12 text-amber-700 dark:text-amber-300",
  server: "bg-rose-500/12 text-rose-700 dark:text-rose-300",
};

const TIME = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

/** One served request; open it for the full address and where it ran. */
export function RequestLogRow({
  log,
  project,
  workspace = false,
}: {
  log: RequestLogItem;
  project?: { name: string; href: string };
  /** Rows mix projects, so the last column names the project. */
  workspace?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const kind = statusClass(log.status);
  const address = `https://${log.host}${log.path}`;
  return (
    <div
      className={cn(
        "border-b border-hairline last:border-b-0",
        kind === "server" && "bg-rose-500/[0.03]",
      )}
    >
      <button
        aria-expanded={open}
        className="grid w-full grid-cols-[4.5rem_2.75rem_minmax(0,1fr)_3.5rem] items-center gap-3 px-4 py-2 text-left font-geist-mono text-[12px] outline-none transition-colors hover:bg-foreground/[0.03] focus-visible:bg-foreground/[0.04] md:grid-cols-[5rem_2.75rem_3.75rem_minmax(0,1fr)_4rem_3.5rem] xl:grid-cols-[5rem_2.75rem_3.75rem_minmax(0,1fr)_4rem_3.5rem_8rem]"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <time className="text-muted-foreground" dateTime={log.timestamp}>
          {TIME.format(new Date(log.timestamp))}
        </time>
        <span
          className={cn(
            "w-fit rounded-full px-1.5 py-px text-[10.5px] font-medium",
            STATUS[kind],
          )}
        >
          {log.status || "—"}
        </span>
        <span className="hidden text-muted-foreground md:block">
          {log.method}
        </span>
        <span className="min-w-0 truncate text-foreground/85">
          <span className="text-muted-foreground">{log.host}</span>
          {log.path}
        </span>
        <span className="text-right text-muted-foreground">
          {Math.round(log.durationMs)} ms
        </span>
        <span className="hidden text-muted-foreground md:block">
          {log.colo || log.country || "—"}
        </span>
        <span className="hidden truncate text-muted-foreground xl:block">
          {workspace && project ? project.name : log.deploymentId.slice(0, 8)}
        </span>
      </button>
      {open ? (
        <dl className="surface-inset mx-3 mb-3 grid gap-x-6 gap-y-2 rounded-tile p-3 font-geist-mono text-[11.5px] duration-200 animate-in fade-in-0 slide-in-from-top-1 sm:grid-cols-[auto_1fr]">
          <dt className="text-muted-foreground">Address</dt>
          <dd className="flex min-w-0 items-center gap-1">
            <span className="truncate">{address}</span>
            <CopyButton className="size-6" text={address} />
          </dd>
          <dt className="text-muted-foreground">Time</dt>
          <dd>{log.timestamp}</dd>
          <dt className="text-muted-foreground">Served from</dt>
          <dd>
            {[log.colo, log.country].filter(Boolean).join(" · ") || "Unknown"}
          </dd>
          <dt className="text-muted-foreground">Response</dt>
          <dd>
            {log.status} · {formatBytes(log.bytes)} ·{" "}
            {Math.round(log.durationMs)} ms
          </dd>
          <dt className="text-muted-foreground">Deployment</dt>
          <dd className="flex items-center gap-1">
            {project ? (
              <Link
                className="underline-offset-2 hover:underline"
                href={`${project.href}/deployments/${log.deploymentId}`}
              >
                {log.deploymentId}
              </Link>
            ) : (
              log.deploymentId
            )}
            <CopyButton className="size-6" text={log.deploymentId} />
          </dd>
          {log.sampleInterval > 1 ? (
            <>
              <dt className="text-muted-foreground">Sampled</dt>
              <dd>Stands for about {log.sampleInterval} requests</dd>
            </>
          ) : null}
        </dl>
      ) : null}
    </div>
  );
}
