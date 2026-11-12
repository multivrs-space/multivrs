/** One error line a deployment printed while serving. */
export interface ErrorEvent {
  id: string;
  message: string;
  at: string;
  projectId: string;
  deploymentId: string;
  requestId?: string | null;
}

/** Error events that share a cause, grouped like an error tracker does. */
export interface ErrorIssue {
  id: string;
  /** "TypeError", "Error"… read from the message. */
  type: string;
  title: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  projectIds: string[];
  deployments: number;
  /** Events per UTC day over the window, oldest first. */
  daily: number[];
  latest: ErrorEvent;
  /** First seen in the last 24 hours. */
  isNew: boolean;
}
