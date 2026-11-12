/**
 * Merge tags in broadcasts: `{{first_name}}`, `{{email}}`, or any contact
 * property such as `{{company}}`, with an optional fallback for contacts
 * that don't have it: `{{first_name|there}}`.
 */

export interface MergeContact {
  email: string;
  firstName: string | null;
  lastName: string | null;
  properties: unknown;
}

const TAG = /\{\{\s*([a-zA-Z][\w.]*)\s*(?:\|([^}]*))?\}\}/g;

/** The built-in tags every contact has, in the order the editor offers them. */
export const BUILT_IN_TAGS = ["first_name", "last_name", "email"] as const;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function propertyValues(properties: unknown): Record<string, string> {
  if (
    !properties ||
    typeof properties !== "object" ||
    Array.isArray(properties)
  )
    return {};
  const values: Record<string, string> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (value === null || value === undefined || typeof value === "object")
      continue;
    values[key.toLowerCase()] = String(value);
  }
  return values;
}

export function mergeValues(contact: MergeContact): Record<string, string> {
  return {
    ...propertyValues(contact.properties),
    first_name: contact.firstName ?? "",
    last_name: contact.lastName ?? "",
    email: contact.email,
  };
}

/** Fill every tag; HTML gets escaped values so a name can't inject markup. */
export function personalize(
  template: string,
  values: Record<string, string>,
  format: "html" | "text",
): string {
  return template.replace(TAG, (_, rawKey: string, fallback?: string) => {
    const key = rawKey.toLowerCase().replace(/^contact\./, "");
    const value = values[key]?.trim() || fallback?.trim() || "";
    return format === "html" ? escapeHtml(value) : value;
  });
}
