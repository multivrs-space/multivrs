"use client";

import { CircleCheck, CircleX, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import type { ImportDeploymentStatus } from "@/features/dashboard/hooks/useDeploymentImport";

const STATUS_TEXT: Record<Exclude<ImportDeploymentStatus, "idle">, string> = {
  building: "Building",
  canceled: "Canceled after",
  failed: "Failed after",
  ready: "Ready in",
};

/** Live build status and log tail shown once a deploy has started. */
export function DeploymentProgress({
  cancel,
  deploying,
  detailsUrl,
  logs,
  seconds,
  status,
}: {
  cancel: () => Promise<void>;
  deploying: boolean;
  detailsUrl?: string;
  logs: Array<{ id: string; message: string }>;
  seconds: number;
  status: Exclude<ImportDeploymentStatus, "idle">;
}) {
  const tail = useRef<HTMLDivElement>(null);
  // Keep the newest line in view as logs stream in.
  useEffect(() => {
    if (logs.length) tail.current?.scrollTo({ top: tail.current.scrollHeight });
  }, [logs]);

  return (
    <div className="space-y-3">
      <p
        className="flex items-center gap-2 text-[13px] font-medium"
        aria-live="polite"
      >
        {status === "building" ? (
          <Loader2 className="size-4 animate-spin text-primary" />
        ) : status === "ready" ? (
          <CircleCheck className="size-4 text-emerald-400" />
        ) : (
          <CircleX className="size-4 text-rose-400" />
        )}
        {STATUS_TEXT[status]}
        <span className="font-mono text-xs text-muted-foreground">
          {seconds}s
        </span>
      </p>
      <div
        ref={tail}
        className="h-56 space-y-1 overflow-y-auto rounded-lg border border-(--hairline) bg-black/40 p-3 font-mono text-[11px] leading-relaxed"
      >
        {logs.map((log) => (
          <p key={log.id} className="break-words text-foreground/85">
            {log.message}
          </p>
        ))}
      </div>
      <div className="flex gap-2">
        {deploying ? (
          <Button type="button" size="sm" variant="outline" onClick={cancel}>
            Cancel
          </Button>
        ) : null}
        {detailsUrl ? (
          <Link
            href={detailsUrl}
            className={buttonVariants({ size: "sm", variant: "outline" })}
          >
            Deployment details
          </Link>
        ) : null}
      </div>
    </div>
  );
}
