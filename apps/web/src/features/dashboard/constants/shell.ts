/** Cookie that remembers whether the rail is collapsed, read during SSR. */
export const RAIL_COOKIE = "dash-rail";

export const RAIL_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Sections whose own sub-navigation opens in the context panel. */
export type DashboardContextNav =
  | "mail"
  | "observability"
  | "team-settings"
  | "account";
