import type {
  ErrorEvent,
  ErrorIssue,
} from "@/features/dashboard/types/error-issue.types";

const DAY_MS = 86_400_000;
export const ISSUE_WINDOW_DAYS = 14;

/** The message's first line with the parts that vary per occurrence masked. */
export function fingerprint(message: string): string {
  return (message.split("\n")[0] ?? "")
    .replace(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
      "<id>",
    )
    .replace(/0x[0-9a-f]+/gi, "<hex>")
    .replace(/(["'`]).*?\1/g, "<str>")
    .replace(/\d+(\.\d+)?/g, "<n>")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}

/** "TypeError: x is undefined" → "TypeError"; anything else → "Error". */
export function errorType(message: string): string {
  return (
    /^\s*(?:Uncaught\s+)?((?:[A-Z][A-Za-z]*)?(?:Error|Exception))\b/.exec(
      message,
    )?.[1] ?? "Error"
  );
}

function hash(text: string): string {
  let value = 5381;
  for (let index = 0; index < text.length; index++) {
    value = (value * 33) ^ text.charCodeAt(index);
  }
  return (value >>> 0).toString(36);
}

/**
 * Group error events into issues by fingerprint, busiest-most-recent first,
 * each with a per-day count over the window for its trend line.
 */
export function groupIssues(
  events: readonly ErrorEvent[],
  now = Date.now(),
): ErrorIssue[] {
  const today = Math.floor(now / DAY_MS) * DAY_MS;
  const start = today - (ISSUE_WINDOW_DAYS - 1) * DAY_MS;
  const issues = new Map<string, ErrorIssue & { deploymentIds: Set<string> }>();
  for (const event of events) {
    const key = fingerprint(event.message);
    const at = Date.parse(event.at);
    let issue = issues.get(key);
    if (!issue) {
      const firstLine = event.message.split("\n")[0] ?? event.message;
      issue = {
        id: hash(key),
        type: errorType(event.message),
        title:
          firstLine
            .replace(
              /^\s*(?:Uncaught\s+)?(?:[A-Z][A-Za-z]*)?(?:Error|Exception):\s*/,
              "",
            )
            .slice(0, 160) || firstLine,
        count: 0,
        firstSeen: event.at,
        lastSeen: event.at,
        projectIds: [],
        deployments: 0,
        daily: Array.from({ length: ISSUE_WINDOW_DAYS }, () => 0),
        latest: event,
        isNew: false,
        deploymentIds: new Set(),
      };
      issues.set(key, issue);
    }
    issue.count += 1;
    if (at < Date.parse(issue.firstSeen)) issue.firstSeen = event.at;
    if (at > Date.parse(issue.lastSeen)) {
      issue.lastSeen = event.at;
      issue.latest = event;
    }
    if (!issue.projectIds.includes(event.projectId))
      issue.projectIds.push(event.projectId);
    issue.deploymentIds.add(event.deploymentId);
    const day = Math.floor((at - start) / DAY_MS);
    if (day >= 0 && day < ISSUE_WINDOW_DAYS)
      issue.daily[day] = (issue.daily[day] ?? 0) + 1;
  }
  return [...issues.values()]
    .map(({ deploymentIds, ...issue }) => ({
      ...issue,
      deployments: deploymentIds.size,
      isNew: now - Date.parse(issue.firstSeen) < DAY_MS,
    }))
    .sort((a, b) => Date.parse(b.lastSeen) - Date.parse(a.lastSeen));
}
