export type SpanKind = "http" | "function" | "db" | "cache" | "external";

/** One timed step inside a request. */
export interface TraceSpan {
  id: string;
  parentId: string | null;
  name: string;
  service: string;
  kind: SpanKind;
  /** Milliseconds from the trace's start. */
  startMs: number;
  durationMs: number;
  error?: boolean;
}

/** One request followed through every service it touched. */
export interface Trace {
  id: string;
  name: string;
  at: string;
  durationMs: number;
  status: number;
  spans: TraceSpan[];
}
