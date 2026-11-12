import type { AnalyticsRange } from "@/features/dashboard/types/analytics.types";

/** One event name and who sent it. */
export interface ProductEventRow {
  name: string;
  events: number;
  users: number;
  /** Events per bucket across the range, oldest first. */
  trend: number[];
}

/** Custom events (`track()`), the raw material of product analytics. */
export interface ProductAnalytics {
  state: "ready" | "unconfigured" | "error";
  range: AnalyticsRange;
  events: number;
  /** Distinct visitors who sent at least one event. */
  users: number;
  /** Distinct visitors who viewed a page, to set event reach against. */
  visitors: number;
  series: { label: string; events: number; users: number }[];
  rows: ProductEventRow[];
}
