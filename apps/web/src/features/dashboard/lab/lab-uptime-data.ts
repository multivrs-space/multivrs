import { LAB_NOW } from "@/features/dashboard/lab/lab-observe-data";
import type {
  RegionLatency,
  UptimeDay,
  UptimeIncident,
  UptimeMonitor,
} from "@/features/dashboard/types/uptime.types";

/* Synthetic Observe data for tuning designs in the lab only. Product pages
   never render made-up numbers. */

const ago = (minutes: number) =>
  new Date(LAB_NOW - minutes * 60_000).toISOString();

const days = (bad: [number, UptimeDay][]): UptimeDay[] =>
  Array.from(
    { length: 90 },
    (_, day) => bad.find(([at]) => at === day)?.[1] ?? "up",
  );
export const LAB_MONITORS: UptimeMonitor[] = [
  {
    id: "m1",
    name: "Storefront home",
    url: "https://acme.app",
    kind: "http",
    intervalSeconds: 60,
    regions: ["LOS", "LHR", "IAD", "FRA", "SIN", "GRU"],
    state: "up",
    uptime: 99.98,
    responseMs: 142,
    days: days([[41, "degraded"]]),
  },
  {
    id: "m2",
    name: "Checkout API",
    url: "https://acme.app/api/checkout",
    kind: "http",
    intervalSeconds: 30,
    regions: ["LOS", "LHR", "IAD"],
    state: "degraded",
    uptime: 99.71,
    responseMs: 486,
    days: days([
      [12, "down"],
      [63, "degraded"],
      [89, "degraded"],
    ]),
  },
  {
    id: "m3",
    name: "Sign in flow",
    url: "https://acme.app/login",
    kind: "synthetic",
    intervalSeconds: 300,
    regions: ["LHR", "IAD"],
    state: "up",
    uptime: 100,
    responseMs: 1_840,
    days: days([]),
  },
  {
    id: "m4",
    name: "Docs",
    url: "https://docs.acme.app",
    kind: "http",
    intervalSeconds: 120,
    regions: ["LHR", "FRA", "IAD"],
    state: "down",
    uptime: 99.12,
    responseMs: 0,
    days: days([
      [30, "down"],
      [89, "down"],
    ]),
  },
];
export const LAB_INCIDENTS: UptimeIncident[] = [
  {
    id: "i1",
    monitor: "Docs",
    cause: "503 Service Unavailable",
    startedAt: ago(18),
    resolvedAt: null,
    regions: ["LHR", "FRA", "IAD"],
  },
  {
    id: "i2",
    monitor: "Checkout API",
    cause: "Slower than 1 s",
    startedAt: ago(320),
    resolvedAt: ago(296),
    regions: ["LOS"],
  },
  {
    id: "i3",
    monitor: "Checkout API",
    cause: "Timed out after 10 s",
    startedAt: ago(60 * 24 * 12),
    resolvedAt: ago(60 * 24 * 12 - 41),
    regions: ["LOS", "LHR"],
  },
];
export const LAB_REGIONS: RegionLatency[] = [
  { region: "LOS", city: "Lagos", ms: 88 },
  { region: "LHR", city: "London", ms: 121 },
  { region: "FRA", city: "Frankfurt", ms: 134 },
  { region: "IAD", city: "Virginia", ms: 192 },
  { region: "GRU", city: "São Paulo", ms: 344 },
  { region: "SIN", city: "Singapore", ms: 612 },
];
