"use client";

import { useState } from "react";
import { DashCard } from "@/components/dashboard/DashCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LiveSquareTerminal } from "@/components/icons/animated";
import { DashboardSearchInput } from "@/features/dashboard/components/DashboardSearchInput";
import { FilterPill } from "@/features/dashboard/components/logs/FilterPill";
import { LogHistogram } from "@/features/dashboard/components/logs/LogHistogram";
import { LogRow } from "@/features/dashboard/components/logs/LogRow";
import {
  bucketLogs,
  levelCounts,
} from "@/features/dashboard/lib/log-histogram";
import type {
  RuntimeLogItem,
  RuntimeLogLevel,
} from "@/features/dashboard/types/runtime-log.types";

const LEVELS: { level: RuntimeLogLevel; dot: string }[] = [
  { level: "info", dot: "bg-muted-foreground" },
  { level: "warn", dot: "bg-amber-500" },
  { level: "error", dot: "bg-rose-500" },
];

/** What deployed code printed while serving, newest first. */
export function ConsoleStream({ logs }: { logs: RuntimeLogItem[] }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<RuntimeLogLevel[]>([
    "info",
    "warn",
    "error",
  ]);
  const needle = query.trim().toLowerCase();
  const counts = levelCounts(logs);
  const rows = logs.filter(
    (log) =>
      active.includes(log.level) &&
      `${log.message} ${log.deploymentId} ${log.requestId ?? ""}`
        .toLowerCase()
        .includes(needle),
  );

  if (!logs.length)
    return (
      <DashCard>
        <EmptyState
          description="console.log, warnings and errors from your functions and server code land here as they run."
          glyph={LiveSquareTerminal}
          title="No runtime output yet"
        />
      </DashCard>
    );

  return (
    <>
      <DashCard className="p-5">
        <LogHistogram buckets={bucketLogs(logs)} />
        <p className="mt-3 text-[11.5px] text-muted-foreground">
          The latest {logs.length === 200 ? "200 " : ""}lines, in UTC.
        </p>
      </DashCard>
      <div className="flex flex-wrap items-center gap-2">
        <DashboardSearchInput
          containerClassName="min-w-56 flex-1"
          onValueChange={setQuery}
          placeholder="Search messages, deployments, request IDs"
          value={query}
        />
        {LEVELS.map(({ level, dot }) => (
          <FilterPill
            active={active.includes(level)}
            count={counts[level]}
            dot={dot}
            key={level}
            label={level}
            onToggle={() =>
              setActive((current) =>
                current.includes(level)
                  ? current.filter((item) => item !== level)
                  : [...current, level],
              )
            }
          />
        ))}
      </div>
      <DashCard className="overflow-x-auto">
        <div className="min-w-[640px]">
          {rows.map((log) => (
            <LogRow key={log.id} log={log} />
          ))}
          {rows.length ? null : (
            <p className="p-12 text-center text-[13px] text-muted-foreground">
              No lines match these filters.
            </p>
          )}
        </div>
      </DashCard>
    </>
  );
}
