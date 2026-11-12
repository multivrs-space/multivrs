import type { ContactColumns } from "@/features/mail/contacts/contact-csv";

/**
 * Columns that are never offered as properties: credentials and payment
 * details have no place in a mailing list, whatever an export includes.
 */
const SECRET =
  /pass(word|wd)?|secret|token|digest|hash|salt|totp|otp|mfa|2fa|recovery|ssn|card|cvv|iban|apikey|api_key|private/i;

/** Property keys look like `company` or `signup_source`. */
export const PROPERTY_KEY = /^[a-z][a-z0-9_]{0,39}$/;

export function propertyKey(header: string): string {
  return header
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^[^a-z]+|_+$/g, "")
    .slice(0, 40);
}

export interface ExtraColumn {
  index: number;
  key: string;
  header: string;
}

/** Every other named column a person could keep as a contact property. */
export function extraColumns(
  header: string[],
  columns: ContactColumns,
): ExtraColumn[] {
  const used = new Set(Object.values(columns));
  const seen = new Set<string>();
  return header.flatMap((name, index) => {
    const key = propertyKey(name);
    if (
      used.has(index) ||
      SECRET.test(name) ||
      !PROPERTY_KEY.test(key) ||
      seen.has(key)
    )
      return [];
    if (["first_name", "last_name", "email", "name"].includes(key)) return [];
    seen.add(key);
    return [{ index, key, header: name.trim() }];
  });
}

/** The kept columns' values on one row, or nothing when they're all blank. */
export function propertiesFrom(
  row: string[],
  kept: ExtraColumn[],
): Record<string, string> | undefined {
  const entries = kept
    .map((column) => [
      column.key,
      (row[column.index] ?? "").trim().slice(0, 500),
    ])
    .filter(([, value]) => value);
  return entries.length ? Object.fromEntries(entries) : undefined;
}

export function isSecretColumn(header: string): boolean {
  return SECRET.test(header);
}
