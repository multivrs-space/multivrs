"use client";

import { useState } from "react";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { StatStrip } from "@/components/dashboard/StatStrip";
import { LiveGantt, LiveListFilter } from "@/components/icons/animated";
import { TraceWaterfall } from "@/features/dashboard/components/traces/TraceWaterfall";
import { relativeTime } from "@/features/dashboard/lib/relative-time";
import type { Trace } from "@/features/dashboard/types/trace.types";
import { cn } from "@/lib/utils";

/**
 * Tracing: the slowest requests, each a bar against the slowest, and the
 * picked one opened span by span.
 */
export function TracesBoard({ traces }: { traces: Trace[] }) {
  const [selected, setSelected] = useState(traces[0]?.id ?? "");
  const trace = traces.find((item) => item.id === selected) ?? traces[0];
  const slowest = Math.max(...traces.map((item) => item.durationMs), 1);
  const sorted = [...traces]
    .map((item) => item.durationMs)
    .sort((a, b) => a - b);
  const p95 =
    sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] ?? 0;
  const failed = traces.filter((item) => item.status >= 500).length;
  return (
    <div className="space-y-3">
      <StatStrip
        stats={[
          { label: "Traces", value: String(traces.length), hint: "Last hour" },
          { label: "p95", value: `${p95} ms`, hint: "End to end" },
          {
            label: "Failed",
            value: String(failed),
            tone: failed ? "danger" : "default",
            hint: "5xx responses",
          },
          {
            label: "Spans per trace",
            value: (
              traces.reduce((sum, item) => sum + item.spans.length, 0) /
              Math.max(traces.length, 1)
            ).toFixed(1),
          },
        ]}
      />
      <div className="grid items-start gap-3 lg:grid-cols-12">
        <DashCard aria-label="Requests" className="lg:col-span-5">
          <DashCardHeader
            description="Slowest first"
            icon={LiveListFilter}
            title="Requests"
          />
          <div className="p-2 pt-3">
            {[...traces]
              .sort((a, b) => b.durationMs - a.durationMs)
              .map((item) => (
                <button
                  aria-pressed={item.id === trace?.id}
                  className={cn(
                    "grid w-full grid-cols-[minmax(0,1fr)_5.5rem] items-center gap-x-3 gap-y-1.5 rounded-tile px-3 py-2.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                    item.id === trace?.id
                      ? "bg-foreground/[0.05]"
                      : "hover:bg-foreground/[0.025]",
                  )}
                  key={item.id}
                  onClick={() => setSelected(item.id)}
                  type="button"
                >
                  <span className="truncate font-geist-mono text-[12px]">
                    <span
                      className={
                        item.status >= 500
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-muted-foreground"
                      }
                    >
                      {item.status}{" "}
                    </span>
                    {item.name}
                  </span>
                  <span className="figure text-right text-[12px] font-semibold">
                    {item.durationMs} ms
                  </span>
                  <span className="h-1 overflow-hidden rounded-full bg-foreground/[0.06]">
                    <span
                      className={cn(
                        "block h-full rounded-full",
                        item.status >= 500 ? "bg-rose-500" : "bg-primary",
                      )}
                      style={{ width: `${(item.durationMs / slowest) * 100}%` }}
                    />
                  </span>
                  <span className="whitespace-nowrap text-right font-geist-mono text-[10px] text-muted-foreground">
                    {relativeTime(item.at)}
                  </span>
                </button>
              ))}
          </div>
        </DashCard>
        <DashCard aria-label="Waterfall" className="lg:col-span-7">
          <DashCardHeader
            description={
              trace
                ? `${trace.spans.length} spans · ${trace.durationMs} ms`
                : undefined
            }
            icon={LiveGantt}
            title={trace ? trace.name : "Waterfall"}
          />
          <div className="overflow-x-auto pb-4 pt-4">
            {trace ? <TraceWaterfall trace={trace} /> : null}
          </div>
        </DashCard>
      </div>
    </div>
  );
}
