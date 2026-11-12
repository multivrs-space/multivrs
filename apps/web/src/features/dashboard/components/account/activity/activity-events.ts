import type { DashboardAuditEvent } from "@/lib/services/audit-event.service";

export type ActivityCategory =
  | "sign-in"
  | "security"
  | "tokens"
  | "projects"
  | "account";

/** A sentence with one part to bold: `before` **`strong`** `after`. */
export interface Sentence {
  before: string;
  strong?: string;
  after?: string;
}

const capital = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

/** Which filter an event belongs to. */
export function activityCategory(action: string): ActivityCategory {
  if (action.startsWith("auth.") || action.startsWith("oauth."))
    return "sign-in";
  if (action.includes("2fa") || action.includes("passkey")) return "security";
  if (action.includes("token")) return "tokens";
  if (action.startsWith("project.") || action.startsWith("deployment."))
    return "projects";
  return "account";
}

/** An audit event as a plain sentence about what you did. */
export function describeActivity(event: DashboardAuditEvent): Sentence {
  const meta = (event.metadata as Record<string, unknown>) || {};
  const project = event.projectName || "a project";
  const provider = capital(String(meta.providerId || "GitHub"));
  switch (event.action) {
    case "auth.login":
      return { before: "You signed in." };
    case "auth.logout":
      return { before: "You signed out." };
    case "oauth.connected":
      return { before: "You connected ", strong: provider, after: "." };
    case "oauth.unlinked":
      return { before: "You disconnected ", strong: provider, after: "." };
    case "email.verified":
      return {
        before: "You verified ",
        strong: String(meta.email || "your email"),
        after: ".",
      };
    case "user.created":
      return { before: "You created your Multivrs account." };
    case "user.2fa_enabled":
      return { before: "You turned on two-factor authentication." };
    case "user.2fa_disabled":
      return { before: "Two-factor authentication was turned off." };
    case "api_token.create":
      return {
        before: "You created the token ",
        strong: `“${String(meta.name || "Token")}”`,
        after: ".",
      };
    case "api_token.revoke":
      return { before: "You revoked a token." };
    case "account.update_profile":
      return { before: "You updated your profile." };
    case "project.create":
      return { before: "You created ", strong: project, after: "." };
    case "project.delete":
      return { before: "You deleted a project." };
    case "deployment.create":
      return { before: "You deployed ", strong: project, after: "." };
    default:
      return {
        before: "You did ",
        strong: event.action.split(".").join(" ").replace(/_/g, " "),
        after: event.projectName ? ` in ${event.projectName}.` : ".",
      };
  }
}

export type ActivityWindow = "all" | "30d" | "7d" | "24h";
const WINDOW_MS: Record<Exclude<ActivityWindow, "all">, number> = {
  "30d": 30 * 86_400_000,
  "7d": 7 * 86_400_000,
  "24h": 86_400_000,
};

export function inWindow(
  createdAt: string,
  window: ActivityWindow,
  now = Date.now(),
): boolean {
  return (
    window === "all" || now - new Date(createdAt).getTime() <= WINDOW_MS[window]
  );
}

/** Events grouped by calendar month (UTC), newest first as given. */
export function byMonth(
  events: readonly DashboardAuditEvent[],
): [string, DashboardAuditEvent[]][] {
  const groups = new Map<string, DashboardAuditEvent[]>();
  for (const event of events) {
    const key = new Date(event.createdAt).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
    groups.set(key, [...(groups.get(key) ?? []), event]);
  }
  return [...groups];
}
