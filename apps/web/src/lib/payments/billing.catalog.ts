import type { AddOnKey, PlanKey, ResourceKey } from "./billing.types";

export { METER_CATALOG } from "@/lib/payments/billing-meter-catalog";

/**
 * What each plan includes. Enterprise starts from Pro and its contract
 * raises limits through entitlement overrides; only the limit-exempt team
 * account has none.
 */
export const RESOURCE_LIMITS: Record<
  ResourceKey,
  Record<PlanKey, number | null>
> = {
  bypass_rules: { enterprise: 10, hobby: 0, pro: 10 },
  bulk_redirects: { enterprise: 1_000, hobby: 100, pro: 1_000 },
  concurrent_sandboxes: { enterprise: 2, hobby: 1, pro: 2 },
  cron_jobs: { enterprise: 10, hobby: 2, pro: 10 },
  developer_seats: { enterprise: 1, hobby: 1, pro: 1 },
  edge_config_entries: { enterprise: 1_000, hobby: 100, pro: 1_000 },
  environment_variables: { enterprise: 500, hobby: 50, pro: 500 },
  firewall_rules: { enterprise: 20, hobby: 3, pro: 20 },
  ip_blocks: { enterprise: 50, hobby: 3, pro: 50 },
  log_drains: { enterprise: 1, hobby: 0, pro: 1 },
  mail_aliases: { enterprise: 25, hobby: 3, pro: 25 },
  mail_domains: { enterprise: 3, hobby: 1, pro: 3 },
  mailbox_members: { enterprise: 5, hobby: 0, pro: 5 },
  mailboxes: { enterprise: 5, hobby: 1, pro: 5 },
  microfrontend_routes: { enterprise: 10, hobby: 2, pro: 10 },
  projects: { enterprise: 20, hobby: 3, pro: 20 },
  workflows: { enterprise: 20, hobby: 3, pro: 20 },
};

export const ADD_ON_CATALOG: Record<
  AddOnKey,
  { lookupKey: string; projectScoped: boolean }
> = {
  developer_seat: {
    lookupKey: "multivrs_team_seats_v2",
    projectScoped: false,
  },
  mail_volume: {
    lookupKey: "multivrs_mail_volume_v2",
    projectScoped: false,
  },
  observability_plus: {
    lookupKey: "multivrs_observability_plus_v2",
    projectScoped: false,
  },
  speed_insights: {
    lookupKey: "multivrs_speed_insights_monthly",
    projectScoped: true,
  },
  web_analytics_plus: {
    lookupKey: "multivrs_web_analytics_plus_monthly",
    projectScoped: false,
  },
};
