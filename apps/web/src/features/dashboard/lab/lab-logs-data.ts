import type { LogsData } from "@/features/dashboard/types/request-log.types";

/* Synthetic request and console rows for tuning Logs in the lab only. */

const START = Date.UTC(2026, 9, 27, 14, 0);
const PATHS = [
  "/",
  "/pricing",
  "/api/checkout",
  "/blog/edge-caching",
  "/_next/static/chunks/app.js",
  "/api/session",
  "/docs",
  "/favicon.ico",
];
const COLOS: [string, string][] = [
  ["LOS", "NG"],
  ["LHR", "GB"],
  ["IAD", "US"],
  ["FRA", "DE"],
  ["NRT", "JP"],
];
const PROJECTS = [
  "11111111-1111-4111-8111-111111111111",
  "22222222-2222-4222-8222-222222222222",
];

export const LAB_LOGS: LogsData = {
  requestState: "ready",
  requests: Array.from({ length: 140 }, (_, index) => {
    const path = PATHS[(index * 7) % PATHS.length] ?? "/";
    const [colo, country] = COLOS[(index * 3) % COLOS.length] ?? ["LOS", "NG"];
    const status =
      index % 23 === 0
        ? 502
        : index % 9 === 0
          ? 404
          : index % 13 === 0
            ? 304
            : 200;
    const timestamp = new Date(START - index * 41_000).toISOString();
    return {
      id: `${timestamp}-${index}`,
      timestamp,
      projectId: PROJECTS[index % 2] ?? "",
      deploymentId:
        index % 2
          ? "8f3c2a91-5d1e-4b7a-9c0f-2e6d4a1b7c33"
          : "1a2b3c4d-5e6f-4a1b-8c2d-3e4f5a6b7c8d",
      host: index % 2 ? "docs.acme.app" : "acme.app",
      path,
      method: path.startsWith("/api/checkout") ? "POST" : "GET",
      status,
      durationMs: path.startsWith("/api")
        ? 80 + ((index * 37) % 340)
        : 6 + ((index * 11) % 60),
      bytes: 1_200 + ((index * 977) % 48_000),
      country,
      colo,
      sampleInterval: 1,
    };
  }),
  console: Array.from({ length: 24 }, (_, index) => ({
    id: `console-${index}`,
    deploymentId: "1a2b3c4d-5e6f-4a1b-8c2d-3e4f5a6b7c8d",
    level: index % 7 === 0 ? "error" : index % 4 === 0 ? "warn" : "info",
    message:
      index % 7 === 0
        ? "Error: payment provider timed out after 10000ms"
        : index % 4 === 0
          ? "Slow query: orders.findMany took 812ms"
          : `GET /api/session 200 in ${12 + index} ms`,
    requestId: `req_${index.toString(16).padStart(6, "0")}`,
    source: "runtime",
    timestamp: new Date(START - index * 97_000).toISOString(),
  })),
};

export const LAB_LOG_PROJECTS: [string, { name: string; href: string }][] = [
  [PROJECTS[0] ?? "", { name: "storefront", href: "/acme/storefront" }],
  [PROJECTS[1] ?? "", { name: "docs", href: "/acme/docs" }],
];
