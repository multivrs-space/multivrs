import type { RuntimeLogItem } from "@/features/dashboard/types/runtime-log.types";

/** One request the edge served, as Analytics Engine stored it. */
export interface RequestLogItem {
  id: string;
  timestamp: string;
  projectId: string;
  deploymentId: string;
  host: string;
  path: string;
  method: string;
  status: number;
  durationMs: number;
  bytes: number;
  country: string;
  colo: string;
  /** Requests this row stands for: above 1 when the edge sampled. */
  sampleInterval: number;
}

/** What the Logs page shows for the scope it's in. */
export interface LogsData {
  requests: RequestLogItem[];
  requestState: "ready" | "unconfigured" | "error";
  console: RuntimeLogItem[];
}
