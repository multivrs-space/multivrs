import type { ReactNode } from "react";
import type {
  SpanKind,
  Trace,
  TraceSpan,
} from "@/features/dashboard/types/trace.types";
import { cn } from "@/lib/utils";

const KIND: Record<SpanKind, string> = {
  http: "bg-primary",
  function: "bg-primary/60",
  db: "bg-emerald-500/80",
  cache: "bg-foreground/35",
  external: "bg-amber-500/80",
};

/** Spans in call order, each indented under the span that started it. */
function ordered(
  spans: readonly TraceSpan[],
): (TraceSpan & { depth: number })[] {
  const children = (id: string | null) =>
    spans
      .filter((span) => span.parentId === id)
      .sort((a, b) => a.startMs - b.startMs);
  const walk = (
    id: string | null,
    depth: number,
  ): (TraceSpan & { depth: number })[] =>
    children(id).flatMap((span) => [
      { ...span, depth },
      ...walk(span.id, depth + 1),
    ]);
  return walk(null, 0);
}

/** A request's spans on one timeline: where the time went, and what failed. */
export function TraceWaterfall({ trace }: { trace: Trace }) {
  const total = Math.max(trace.durationMs, 1);
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  return (
    <div className="min-w-[560px]">
      <div className="grid grid-cols-[minmax(0,15rem)_1fr] gap-3 border-b border-hairline px-4 pb-2 font-geist-mono text-[10px] text-muted-foreground">
        <span>Span</span>
        <span className="relative h-3">
          {ticks.map((tick) => (
            <span
              className="absolute -translate-x-1/2 first:translate-x-0 last:-translate-x-full"
              key={tick}
              style={{ left: `${tick * 100}%` }}
            >
              {Math.round(total * tick)} ms
            </span>
          ))}
        </span>
      </div>
      {ordered(trace.spans).map((span) => (
        <div
          className="grid grid-cols-[minmax(0,15rem)_1fr] items-center gap-3 px-4 py-1.5 hover:bg-foreground/[0.025]"
          key={span.id}
        >
          <span
            className="flex min-w-0 items-center gap-1.5 text-[12px]"
            style={{ paddingLeft: span.depth * 12 }}
          >
            <span
              className={cn(
                "size-1.5 shrink-0 rounded-full",
                span.error ? "bg-rose-500" : KIND[span.kind],
              )}
            />
            <span
              className={cn(
                "truncate",
                span.error && "text-rose-700 dark:text-rose-300",
              )}
            >
              {span.name}
            </span>
            <span className="shrink-0 font-geist-mono text-[10px] text-muted-foreground">
              {span.service}
            </span>
          </span>
          <span className="relative h-5">
            {ticks.slice(1, -1).map((tick) => (
              <span
                className="absolute inset-y-0 w-px bg-hairline"
                key={tick}
                style={{ left: `${tick * 100}%` }}
              />
            ))}
            <span
              className={cn(
                "absolute inset-y-1 min-w-[3px] rounded-[4px]",
                span.error ? "bg-rose-500" : KIND[span.kind],
              )}
              style={{
                left: `${(span.startMs / total) * 100}%`,
                width: `${(span.durationMs / total) * 100}%`,
              }}
            />
            <SpanLabel end={(span.startMs + span.durationMs) / total}>
              {span.durationMs} ms
            </SpanLabel>
          </span>
        </div>
      ))}
    </div>
  );
}

/** A span's duration after its bar, or inside its end when there's no room. */
function SpanLabel({ end, children }: { end: number; children: ReactNode }) {
  const inside = end > 0.82;
  return (
    <span
      className={cn(
        "absolute top-1/2 -translate-y-1/2 whitespace-nowrap font-geist-mono text-[10px]",
        inside ? "pr-1.5 text-white/90" : "pl-1.5 text-muted-foreground",
      )}
      style={
        inside ? { right: `${100 - end * 100}%` } : { left: `${end * 100}%` }
      }
    >
      {children}
    </span>
  );
}
