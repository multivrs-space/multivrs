/** Human wording for firewall rule parts, shared by the composer and the list. */

export const CONDITION_TYPES: Record<string, string> = {
  path: "path",
  ip: "IP address",
  country: "country",
  method: "method",
  user_agent: "user agent",
};

export const OPERATORS: Record<string, string> = {
  eq: "is",
  contains: "contains",
  starts_with: "starts with",
  regex: "matches",
};

export const ACTIONS: Record<string, string> = {
  deny: "Block",
  allow: "Allow",
  challenge: "Challenge",
  rate_limit: "Rate limit",
};

export const ACTION_CHIP: Record<string, string> = {
  deny: "bg-rose-500/12 text-rose-700 dark:text-rose-300",
  allow: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  challenge: "bg-amber-500/12 text-amber-700 dark:text-amber-300",
  rate_limit: "bg-primary/12 text-primary",
};

/** "path starts with “/admin”" for one condition. */
export function describeCondition(
  type: string,
  op: string,
  value: string | string[],
): string {
  const shown = Array.isArray(value) ? value.join(", ") : value;
  return `${CONDITION_TYPES[type] ?? type} ${OPERATORS[op] ?? op} “${shown}”`;
}
