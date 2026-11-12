export type RuntimeLogLevel = "info" | "warn" | "error";

export interface RuntimeLogItem {
  id: string;
  deploymentId: string;
  projectId?: string;
  requestId?: string | null;
  level: RuntimeLogLevel;
  message: string;
  source: string;
  timestamp: string;
}
