"use client";

import { useState } from "react";
import { DashCard } from "@/components/dashboard/DashCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import {
  formatCompact,
  formatPercent,
} from "@/components/dashboard/lib/format";
import { LiveGlobe } from "@/components/icons/animated";
import { DashboardSearchInput } from "@/features/dashboard/components/DashboardSearchInput";
import { FilterPill } from "@/features/dashboard/components/logs/FilterPill";
import { LogHistogram } from "@/features/dashboard/components/logs/LogHistogram";
import { RequestLogRow } from "@/features/dashboard/components/logs/RequestLogRow";
import { bucketLogs } from "@/features/dashboard/lib/log-histogram";
import {
  requestStats,
  type StatusClass,
  statusClass,
  statusLevel,
} from "@/features/dashboard/lib/request-log-stats";
import type { RequestLogItem } from "@/features/dashboard/types/request-log.types";

const CLASSES: { value: StatusClass; label: string; dot: string }[] = [
  { value: "ok", label: "2xx–3xx", dot: "bg-muted-foreground" },
  { value: "client", label: "4xx", dot: "bg-amber-500" },
  { value: "server", label: "5xx", dot: "bg-rose-500" },
];

/** Requests the edge served in the last day: their shape, then each one. */
export function RequestStream({
  logs,
  projects,
  workspace,
}: {
  logs: RequestLogItem[];
  projects: Map<string, { name: string; href: string }>;
  workspace: boolean;
}) {
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState<StatusClass[]>(["ok", "client", "server"]);
  const stats = requestStats(logs);
  const needle = query.trim().toLowerCase();
  const rows = logs.filter(
    (log) =>
      shown.includes(statusClass(log.status)) &&
      `${log.status} ${log.method} ${log.host}${log.path} ${projects.get(log.projectId)?.name ?? ""}`
        .toLowerCase()
        .includes(needle),
  );

  if (!logs.length)
    return (
      <DashCard>
        <EmptyState
          description="Requests to your live deployments show up here within a minute of being served."
          glyph={LiveGlobe}
          title="No requests in the last day"
        />
      </DashCard>
    );

  const figures = [
    ["Requests", formatCompact(stats.total)],
    ["5xx", stats.serverRate === null ? "—" : formatPercent(stats.serverRate)],
    ["4xx", stats.clientRate === null ? "—" : formatPercent(stats.clientRate)],
    ["p50", stats.p50 === null ? "—" : `${Math.round(stats.p50)} ms`],
    ["p95", stats.p95 === null ? "—" : `${Math.round(stats.p95)} ms`],
  ];
  return (
    <>
      <DashCard className="p-5">
        <dl className="mb-5 flex flex-wrap gap-x-8 gap-y-3">
          {figures.map(([label, value]) => (
            <div key={label}>
              <dt className="text-[11.5px] text-muted-foreground">{label}</dt>
              <dd className="figure mt-0.5 text-[20px] font-semibold leading-none">
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <LogHistogram
          buckets={bucketLogs(
            logs.map((log) => ({
              timestamp: log.timestamp,
              level: statusLevel(log.status),
            })),
          )}
          label="Requests over time by status"
        />
        <p className="mt-3 text-[11.5px] text-muted-foreground">
          The latest {logs.length === 500 ? "500 " : ""}requests from the last
          24 hours, in UTC.
          {stats.sampled
            ? " Busy stretches are sampled at the edge, so counts are weighted estimates."
            : ""}
        </p>
      </DashCard>
      <div className="flex flex-wrap items-center gap-2">
        <DashboardSearchInput
          containerClassName="min-w-56 flex-1"
          onValueChange={setQuery}
          placeholder="Search paths, hosts, methods, status codes"
          value={query}
        />
        {CLASSES.map((item) => (
          <FilterPill
            active={shown.includes(item.value)}
            count={stats.counts[item.value]}
            dot={item.dot}
            key={item.value}
            label={item.label}
            onToggle={() =>
              setShown((current) =>
                current.includes(item.value)
                  ? current.filter((value) => value !== item.value)
                  : [...current, item.value],
              )
            }
          />
        ))}
      </div>
      <DashCard className="overflow-x-auto">
        <div className="min-w-[560px]">
          {rows.map((log) => (
            <RequestLogRow
              key={log.id}
              log={log}
              project={projects.get(log.projectId)}
              workspace={workspace}
            />
          ))}
          {rows.length ? null : (
            <p className="p-12 text-center text-[13px] text-muted-foreground">
              No requests match these filters.
            </p>
          )}
        </div>
      </DashCard>
    </>
  );
}
