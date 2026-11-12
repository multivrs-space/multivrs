import { z } from "zod";
import {
  addressIn,
  type ContactColumns,
  contactColumns,
  parseCsv,
} from "@/features/mail/contacts/contact-csv";
import {
  type ExtraColumn,
  extraColumns,
  propertiesFrom,
} from "@/features/mail/contacts/contact-properties";

/** The same check the server runs, so a batch is never rejected for one row. */
const emailSchema = z.email();

export interface ImportContact {
  email: string;
  firstName?: string;
  lastName?: string;
  tags: string[];
  /** Values from the extra columns the person chose to keep. */
  properties?: Record<string, string>;
}

export interface CsvFileSummary {
  key: string;
  name: string;
  rows: number;
  contacts: number;
  invalid: number;
  /** No column of addresses could be found. */
  unreadable: boolean;
}

export interface MergedContacts {
  contacts: ImportContact[];
  files: CsvFileSummary[];
  /** Rows whose address was already in an earlier row or file. */
  duplicates: number;
  invalid: number;
  /** Other columns across the files that could be kept as properties. */
  columns: { key: string; header: string }[];
}

const clip = (value: string | undefined, length: number) =>
  value?.trim().slice(0, length) || undefined;

function isEmail(value: string) {
  return emailSchema.safeParse(value).success;
}

/** A header row, or for files without one, the column holding addresses. */
function layout(
  rows: string[][],
): { columns: ContactColumns; extras: ExtraColumn[]; start: number } | null {
  const header = rows[0] ?? [];
  const named = contactColumns(header);
  if (named)
    return { columns: named, extras: extraColumns(header, named), start: 1 };
  const email = header.findIndex((value) => isEmail(addressIn(value)));
  return email >= 0 ? { columns: { email }, extras: [], start: 0 } : null;
}

function contactFrom(
  row: string[],
  columns: ContactColumns,
  kept: ExtraColumn[],
): ImportContact {
  const cell = (index?: number) =>
    index === undefined ? "" : (row[index] ?? "").trim();
  const [first, ...rest] = cell(columns.name).split(/\s+/);
  return {
    email: addressIn(cell(columns.email)),
    firstName: clip(cell(columns.firstName) || first, 120),
    lastName: clip(cell(columns.lastName) || rest.join(" "), 120),
    tags: cell(columns.tags)
      .split(/[,;|]/)
      .map((tag) => tag.trim().slice(0, 64))
      .filter(Boolean),
    properties: propertiesFrom(row, kept),
  };
}

/** Later rows fill names an earlier row left blank; tags add up. */
function merged(into: ImportContact, next: ImportContact): ImportContact {
  return {
    email: into.email,
    firstName: into.firstName ?? next.firstName,
    lastName: into.lastName ?? next.lastName,
    tags: [...new Set([...into.tags, ...next.tags])].slice(0, 30),
    properties:
      into.properties || next.properties
        ? { ...next.properties, ...into.properties }
        : undefined,
  };
}

/** One list from any number of exports, one contact per address. */
export function mergeContactFiles(
  files: { key?: string; name: string; text: string }[],
  keep: readonly string[] = [],
): MergedContacts {
  const columns = new Map<string, string>();
  const byEmail = new Map<string, ImportContact>();
  const summaries: CsvFileSummary[] = [];
  let duplicates = 0;
  let invalid = 0;
  for (const file of files) {
    const rows = parseCsv(file.text);
    const found = layout(rows);
    const summary: CsvFileSummary = {
      key: file.key ?? file.name,
      name: file.name,
      rows: Math.max(rows.length - (found?.start ?? 0), 0),
      contacts: 0,
      invalid: 0,
      unreadable: !found,
    };
    summaries.push(summary);
    if (!found) continue;
    for (const extra of found.extras)
      if (!columns.has(extra.key)) columns.set(extra.key, extra.header);
    const kept = found.extras.filter((extra) => keep.includes(extra.key));
    for (const row of rows.slice(found.start)) {
      const contact = contactFrom(row, found.columns, kept);
      if (!isEmail(contact.email)) {
        summary.invalid += 1;
        invalid += 1;
        continue;
      }
      summary.contacts += 1;
      const earlier = byEmail.get(contact.email);
      if (earlier) duplicates += 1;
      byEmail.set(contact.email, earlier ? merged(earlier, contact) : contact);
    }
  }
  return {
    contacts: [...byEmail.values()],
    files: summaries,
    duplicates,
    invalid,
    columns: [...columns].map(([key, header]) => ({ key, header })),
  };
}
