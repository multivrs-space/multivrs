import { LAB_NOW } from "@/features/dashboard/lab/lab-observe-data";
import type {
  AlertChannel,
  AlertFiring,
  AlertRule,
} from "@/features/dashboard/types/alert.types";

/* Synthetic Observe data for tuning designs in the lab only. Product pages
   never render made-up numbers. */

const ago = (minutes: number) =>
  new Date(LAB_NOW - minutes * 60_000).toISOString();

export const LAB_RULES: AlertRule[] = [
  {
    id: "r1",
    signal: "errors",
    metric: "5xx rate",
    comparison: "above",
    threshold: "2%",
    window: "5 minutes",
    scope: "storefront",
    channels: ["email", "slack"],
    state: "firing",
    lastFiredAt: ago(12),
  },
  {
    id: "r2",
    signal: "uptime",
    metric: "a check",
    comparison: "below",
    threshold: "passing",
    window: "2 runs",
    scope: "every project",
    channels: ["email", "webhook"],
    state: "ok",
    lastFiredAt: ago(60 * 26),
  },
  {
    id: "r3",
    signal: "latency",
    metric: "p95 response",
    comparison: "above",
    threshold: "800 ms",
    window: "10 minutes",
    scope: "storefront",
    channels: ["slack"],
    state: "ok",
    lastFiredAt: null,
  },
  {
    id: "r4",
    signal: "usage",
    metric: "edge requests",
    comparison: "above",
    threshold: "90% of plan",
    window: "the period",
    scope: "every project",
    channels: ["email"],
    state: "ok",
    lastFiredAt: ago(60 * 24 * 3),
  },
  {
    id: "r5",
    signal: "logs",
    metric: "lines matching “payment”",
    comparison: "above",
    threshold: "20",
    window: "1 minute",
    scope: "storefront",
    channels: ["webhook"],
    state: "muted",
    lastFiredAt: ago(60 * 24 * 5),
  },
];
export const LAB_FIRINGS: AlertFiring[] = [
  {
    id: "f1",
    rule: "5xx rate on storefront",
    value: "3.4%",
    firedAt: ago(12),
    resolvedAt: null,
  },
  {
    id: "f2",
    rule: "Docs check failing",
    value: "3 of 3 regions",
    firedAt: ago(60 * 26),
    resolvedAt: ago(60 * 25),
  },
  {
    id: "f3",
    rule: "Edge requests vs plan",
    value: "91%",
    firedAt: ago(60 * 24 * 3),
    resolvedAt: ago(60 * 24 * 3 - 5),
  },
];
export const LAB_CHANNELS: AlertChannel[] = [
  { kind: "email", target: "oncall@acme.app" },
  { kind: "slack", target: "#incidents" },
  { kind: "webhook", target: "https://hooks.acme.app/alerts" },
];
