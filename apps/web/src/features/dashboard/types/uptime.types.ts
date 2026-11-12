export type UptimeState = "up" | "degraded" | "down" | "paused";
export type UptimeDay = "up" | "degraded" | "down" | "none";

/** A check run against a URL from several regions on a schedule. */
export interface UptimeMonitor {
  id: string;
  name: string;
  url: string;
  /** `http` pings a URL; `synthetic` runs a multi-step script, like a login. */
  kind: "http" | "synthetic";
  intervalSeconds: number;
  regions: string[];
  state: UptimeState;
  /** Percent of checks that passed in the last 30 days. */
  uptime: number;
  responseMs: number;
  /** One entry per day for the last 90 days, oldest first. */
  days: UptimeDay[];
}

export interface UptimeIncident {
  id: string;
  monitor: string;
  cause: string;
  startedAt: string;
  resolvedAt: string | null;
  regions: string[];
}

export interface RegionLatency {
  region: string;
  city: string;
  ms: number;
}
