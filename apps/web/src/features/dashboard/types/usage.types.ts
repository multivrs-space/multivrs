import type { DisplayPlan } from "@/lib/payments/billing.types";

/** One UTC day of edge traffic. */
export interface UsagePoint {
  day: string;
  requests: number;
  bytes: number;
}

/** A metered resource over the current billing period. */
export interface UsageMeter {
  used: number;
  /**
   * What the plan includes this period: `null` when the plan has no cap,
   * absent when the resource isn't billed (a count of things, not use).
   */
  included?: number | null;
  /** Each day of the period so far, oldest first. Empty for amounts held. */
  daily: number[];
}

export interface AccountUsage {
  /** Edge latency, data served and requests over the billing period. */
  averageLatency: number;
  bandwidthBytes: number;
  requests: number;
  /** The last 31 UTC days of edge traffic, oldest first. */
  series: UsagePoint[];
  /** `used` per meter key, kept for views that only show totals. */
  metrics: Record<string, number>;
  meters: Record<string, UsageMeter>;
  /** ISO dates; `end` is exclusive. */
  period: { start: string; end: string };
  /** When these figures were read; period maths uses it, not the clock. */
  measuredAt: string;
  plan: DisplayPlan;
  state: "ready" | "unconfigured" | "error";
}
