"use client";

import { useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import type { RuntimeLogItem } from "@/features/dashboard/types/runtime-log.types";
import { cn } from "@/lib/utils";

const LEVEL = {
  info: "bg-foreground/6 text-muted-foreground",
  warn: "bg-amber-500/12 text-amber-700 dark:text-amber-300",
  error: "bg-rose-500/12 text-rose-700 dark:text-rose-300",
};

const TIME = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

/** One log event; click to see the full message and its identifiers. */
export function LogRow({ log }: { log: RuntimeLogItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        "border-b border-hairline last:border-b-0",
        log.level === "error" && "bg-rose-500/[0.03]",
      )}
    >
      <button
        aria-expanded={open}
        className="grid w-full grid-cols-[5.5rem_4rem_6rem_minmax(0,1fr)] items-center gap-3 px-4 py-2 text-left font-geist-mono text-[12px] outline-none transition-colors hover:bg-foreground/[0.03] focus-visible:bg-foreground/[0.04] md:grid-cols-[5.5rem_4rem_7rem_8rem_minmax(0,1fr)]"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <time className="text-muted-foreground" dateTime={log.timestamp}>
          {TIME.format(new Date(log.timestamp))}
        </time>
        <span
          className={cn(
            "w-fit rounded-full px-1.5 py-px text-[10.5px] font-medium",
            LEVEL[log.level],
          )}
        >
          {log.level}
        </span>
        <span className="truncate text-muted-foreground">{log.source}</span>
        <span className="hidden truncate text-muted-foreground md:block">
          {log.deploymentId.slice(0, 12)}
        </span>
        <span
          className={cn(
            "text-foreground/85",
            open ? "whitespace-normal break-words" : "truncate",
          )}
        >
          {log.message}
        </span>
      </button>
      {open ? (
        <dl className="surface-inset mx-3 mb-3 grid gap-x-6 gap-y-2 rounded-tile p-3 font-geist-mono text-[11.5px] duration-200 animate-in fade-in-0 slide-in-from-top-1 sm:grid-cols-[auto_1fr]">
          <dt className="text-muted-foreground">Time</dt>
          <dd>{new Date(log.timestamp).toISOString()}</dd>
          <dt className="text-muted-foreground">Deployment</dt>
          <dd className="flex items-center gap-1">
            {log.deploymentId}
            <CopyButton className="size-6" text={log.deploymentId} />
          </dd>
          <dt className="text-muted-foreground">Message</dt>
          <dd className="flex items-start gap-1">
            <pre className="min-w-0 flex-1 whitespace-pre-wrap break-words">
              {log.message}
            </pre>
            <CopyButton className="size-6" text={log.message} />
          </dd>
        </dl>
      ) : null}
    </div>
  );
}
