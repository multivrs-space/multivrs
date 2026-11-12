export type AlertChannelKind = "email" | "webhook" | "slack";
export type AlertSignal =
  | "errors"
  | "latency"
  | "uptime"
  | "traffic"
  | "usage"
  | "logs";

/** A rule reads as a sentence: when <metric> is <comparison> <threshold> for <window>. */
export interface AlertRule {
  id: string;
  signal: AlertSignal;
  metric: string;
  comparison: "above" | "below";
  threshold: string;
  window: string;
  /** A project name, or "every project". */
  scope: string;
  channels: AlertChannelKind[];
  state: "ok" | "firing" | "muted";
  lastFiredAt: string | null;
}

export interface AlertFiring {
  id: string;
  rule: string;
  value: string;
  firedAt: string;
  resolvedAt: string | null;
}

export interface AlertChannel {
  kind: AlertChannelKind;
  target: string;
}
