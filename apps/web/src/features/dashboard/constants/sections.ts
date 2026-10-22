import { DASHBOARD_NAV_ITEMS } from "./navigation";

/** One-line description shown under each section title. */
const SECTION_DESCRIPTIONS: Record<string, string> = {
  deployments: "Every build and promotion across this scope.",
  logs: "Real-time and historical runtime logs.",
  analytics: "Traffic, audiences and conversion insight.",
  "speed-insights": "Core Web Vitals from real visitors.",
  observability: "Traces, metrics and health across services.",
  firewall: "Traffic rules, rate limits and attack mitigation.",
  cdn: "Edge cache, regions and asset delivery.",
  "environment-variables": "Encrypted build and runtime configuration.",
  integrations: "OIDC and cloud identity integrations.",
  sandboxes: "Ephemeral isolated development environments.",
  workflows: "Durable steps, event runs and UTC schedules.",
  domains: "Custom domains, DNS and certificates.",
  emails: "Transactional delivery, templates and logs.",
  templates: "Create and sell templates in the Multivrs marketplace.",
  settings: "Account, members, billing and developer settings.",
};

export interface SectionMeta {
  slug: string;
  title: string;
  description: string;
}

/** `email` is the domain-detail folder; the mailbox nav slug is `emails`. */
export function canonicalSectionSlug(slug: string): string {
  return slug === "email" ? "emails" : slug;
}

/** Resolve metadata for a section slug, or `null` if it isn't a known route. */
export function getSectionMeta(slug: string): SectionMeta | null {
  const canonical = canonicalSectionSlug(slug);
  const item = DASHBOARD_NAV_ITEMS.find(
    (i) => i.slug === canonical && i.slug !== "",
  );
  if (!item) return null;
  return {
    slug: canonical,
    title: item.name,
    description: SECTION_DESCRIPTIONS[canonical] ?? "",
  };
}
