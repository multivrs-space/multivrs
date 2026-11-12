export interface AnalyticsPoint {
  bandwidthBytes: number;
  errors: number;
  label: string;
  latency: number;
  pageviews: number;
  requests: number;
}

export interface AnalyticsBreakdownItem {
  label: string;
  requests: number;
}

export interface PlatformAnalytics {
  averageLatency: number;
  bandwidthBytes: number;
  bounceRate: number;
  errorRate: number;
  devices: AnalyticsBreakdownItem[];
  pageviews: number;
  range: AnalyticsRange;
  referrers: AnalyticsBreakdownItem[];
  requests: number;
  sessions: number;
  series: AnalyticsPoint[];
  sources: AnalyticsBreakdownItem[];
  visitors: number;
  paths: AnalyticsBreakdownItem[];
  countries: AnalyticsBreakdownItem[];
  state: "ready" | "unconfigured" | "error" | "locked";
  /** Totals for the previous window of the same length, for deltas. */
  previous?: AnalyticsTotals | null;
}

export interface AnalyticsTotals {
  bounceRate: number;
  errorRate: number;
  pageviews: number;
  requests: number;
  sessions: number;
  visitors: number;
}

export type AnalyticsRange = "24h" | "7d" | "30d";

/** Who the visitors are, beyond the page-view totals. */
export interface AnalyticsAudience {
  /** Distinct visitors with a page view or event in the last five minutes. */
  live: number;
  /**
   * Distinct visitors per country (ISO-2). Empty until the edge records
   * country on page views; the map then falls back to request countries.
   */
  countries: AnalyticsBreakdownItem[];
  /** Busiest cities as "City, CC", for the map's callouts. */
  cities: AnalyticsBreakdownItem[];
  browsers: AnalyticsBreakdownItem[];
  /** Custom events (clicks, sign-ups…) by name. */
  events: AnalyticsBreakdownItem[];
}

export interface WebVitalMetric {
  goodRate: number;
  name: "CLS" | "INP" | "LCP" | "TTFB";
  samples: number;
  value: number;
}

export interface WebVitalRoute {
  metrics: Partial<Record<WebVitalMetric["name"], number>>;
  path: string;
  samples: number;
}

export interface WebVitalsData {
  devices: AnalyticsBreakdownItem[];
  metrics: WebVitalMetric[];
  range: AnalyticsRange;
  routes: WebVitalRoute[];
  state: "ready" | "unconfigured" | "error" | "locked";
}
