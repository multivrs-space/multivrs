import type { OrbTone } from "@/components/dashboard/StatusOrb";
import type { AnimatedIcon } from "@/components/icons/animated";
import {
  MAIL_NAVIGATION,
  type MailView,
} from "@/features/mail/mail-navigation";
import { MAIL_RESOURCE_COPY } from "@/features/mail/resources/mail-resource-copy";

export type MailResourceView = Extract<
  MailView,
  | "logs"
  | "broadcasts"
  | "automations"
  | "templates"
  | "contacts"
  | "audiences"
  | "domains"
  | "mailboxes"
  | "credentials"
  | "webhooks"
>;

export interface MailResourceViewConfig {
  title: string;
  icon: AnimatedIcon;
  description: string;
  /** Cards for things you open and work on; rows for long lists. */
  layout: "cards" | "rows";
  /** Names that are addresses or URLs read better in mono. */
  mono?: boolean;
  /** `chip` for statuses that are kinds, not health (API vs SMTP). */
  status: "orb" | "chip";
  /** Only these have a delete endpoint. */
  deletable?: boolean;
  empty: string;
}

export function mailResourceView(
  view: MailResourceView,
): MailResourceViewConfig {
  const nav = MAIL_NAVIGATION.find(
    (item) => "view" in item && item.view === view,
  );
  const fallback = { title: view, icon: MAIL_NAVIGATION[0].icon };
  return {
    ...(nav && "view" in nav ? { title: nav.label, icon: nav.icon } : fallback),
    ...MAIL_RESOURCE_COPY[view],
  };
}

const TONES: [OrbTone, readonly string[]][] = [
  [
    "ready",
    [
      "verified",
      "active",
      "delivered",
      "sent",
      "subscribed",
      "published",
      "enabled",
      "completed",
    ],
  ],
  ["building", ["pending", "sending", "processing", "deferred"]],
  ["queued", ["queued", "scheduled"]],
  ["error", ["failed", "bounced", "complained", "suppressed", "rejected"]],
];

/** What a mail status means at a glance; unknown states read as idle. */
export function mailStatusTone(status: string): OrbTone {
  return TONES.find(([, states]) => states.includes(status))?.[0] ?? "idle";
}

/** "live api" → "Live API": statuses read as words, acronyms stay upper. */
export function statusLabel(status: string): string {
  return status
    .split(/[\s_-]+/)
    .map((word) =>
      ["api", "smtp", "dns"].includes(word)
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}
