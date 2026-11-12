"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { SegmentedControl } from "@/components/dashboard/SegmentedControl";
import { LiveCopy, LiveSquareTerminal } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { DashboardSearchInput } from "@/features/dashboard/components/DashboardSearchInput";
import { BuildLogLines } from "@/features/dashboard/components/deployments/BuildLogLines";
import { BuildPhases } from "@/features/dashboard/components/deployments/BuildPhases";
import type { BuildPhase } from "@/features/dashboard/lib/build-phases";
import type { DashboardDeploymentLog } from "@/lib/services/deployment-detail.types";

/**
 * The build log as a terminal: searchable, filterable to errors, copyable.
 * While the build runs it follows new lines, unless you've scrolled up.
 */
export function BuildLogViewer({
  logs,
  live = false,
  steps,
  stepsSince,
}: {
  logs: DashboardDeploymentLog[];
  live?: boolean;
  /** The build's steps, shown above the log when given. */
  steps?: readonly BuildPhase[];
  stepsSince?: string;
}) {
  const [query, setQuery] = useState("");
  const tail = useRef<HTMLDivElement>(null);
  const following = useRef(true);
  useEffect(() => {
    const box = tail.current;
    if (live && box && following.current && logs.length) {
      box.scrollTop = box.scrollHeight;
    }
  }, [live, logs.length]);
  const [level, setLevel] = useState<"all" | "error">("all");
  const needle = query.trim().toLowerCase();
  const errors = logs.filter((log) => log.level === "error").length;
  const visible = logs
    .map((log, index) => ({ log, line: index + 1 }))
    .filter(
      ({ log }) =>
        (level === "all" || log.level === "error") &&
        (!needle || log.message.toLowerCase().includes(needle)),
    );

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(
        logs.map((log) => log.message).join("\n"),
      );
      toast.success("Build log copied");
    } catch {
      toast.error("Couldn't copy the log");
    }
  }

  return (
    <DashCard aria-label="Build log">
      <DashCardHeader
        action={
          <span className="flex items-center gap-2">
            {live ? (
              <span className="flex items-center gap-1.5 rounded-full bg-amber-500/12 px-2.5 py-1 text-[11.5px] font-medium text-amber-700 dark:text-amber-300">
                <span className="size-1.5 animate-pulse rounded-full bg-amber-500 motion-reduce:animate-none" />
                Live
              </span>
            ) : null}
            <Button
              data-icon-trigger
              disabled={!logs.length}
              onClick={copyAll}
              size="sm"
              variant="raised"
            >
              <LiveCopy strokeWidth={1.75} />
              Copy
            </Button>
          </span>
        }
        description={`${logs.length.toLocaleString("en")} lines${errors ? ` · ${errors} errors` : ""}`}
        icon={LiveSquareTerminal}
        title="Build log"
      />
      {steps ? (
        <BuildPhases className="px-5 pt-4" phases={steps} since={stepsSince} />
      ) : null}
      <div className="flex flex-wrap gap-2 px-5 pt-4">
        <DashboardSearchInput
          containerClassName="min-w-48 flex-1"
          onValueChange={setQuery}
          placeholder="Find in log"
          size="sm"
          value={query}
        />
        <SegmentedControl
          aria-label="Level"
          onChange={setLevel}
          options={[
            { value: "all", label: "All" },
            { value: "error", label: "Errors", count: errors },
          ]}
          value={level}
        />
      </div>
      <div
        className="surface-inset m-2 mt-3 max-h-[60vh] overflow-auto rounded-tile py-2 font-geist-mono text-[11.5px] leading-relaxed"
        onScroll={(event) => {
          const box = event.currentTarget;
          following.current =
            box.scrollHeight - box.scrollTop - box.clientHeight < 48;
        }}
        ref={tail}
      >
        <BuildLogLines
          emptyText={
            logs.length
              ? "No lines match."
              : live
                ? "Waiting for the build to start…"
                : "No build logs were recorded."
          }
          lines={visible}
        />
      </div>
    </DashCard>
  );
}
