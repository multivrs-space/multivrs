/**
 * Reading contact exports: any CSV a CRM, auth provider, store or
 * spreadsheet produces. Quoted fields, doubled quotes, line breaks inside
 * quotes, CRLF, a byte-order mark, and comma, semicolon or tab separators.
 */

const SEPARATORS = [",", ";", "\t"] as const;

function separatorOf(text: string): string {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  let best: string = ",";
  let most = 0;
  for (const separator of SEPARATORS) {
    const count = firstLine.split(separator).length - 1;
    if (count > most) {
      best = separator;
      most = count;
    }
  }
  return best;
}

export function parseCsv(input: string): string[][] {
  const text = input.replace(/^﻿/, "");
  const separator = separatorOf(text);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const endRow = () => {
    row.push(field);
    if (row.some((value) => value.trim())) rows.push(row);
    row = [];
    field = "";
  };
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char !== '"') field += char;
      else if (text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else quoted = false;
    } else if (char === '"' && !field.trim()) {
      field = "";
      quoted = true;
    } else if (char === separator) {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      endRow();
    } else field += char;
  }
  if (field || row.length) endRow();
  return rows;
}

export interface ContactColumns {
  email: number;
  firstName?: number;
  lastName?: number;
  name?: number;
  tags?: number;
}

const HEADERS: Record<Exclude<keyof ContactColumns, "email">, string[]> = {
  firstName: ["firstname", "first", "givenname", "fname", "forename"],
  lastName: ["lastname", "last", "surname", "familyname", "lname"],
  name: ["name", "fullname", "displayname", "contactname", "customername"],
  tags: ["tags", "tag", "labels", "label", "segments"],
};

const EMAIL_HEADERS = ["email", "emailaddress", "mail", "emails"];

function normalized(header: string): string {
  return header.toLowerCase().replace(/[^a-z]/g, "");
}

/**
 * Which columns hold what, from the header row. The exact "email" header
 * wins over others that mention email ("Email verified", "Work email").
 */
export function contactColumns(header: string[]): ContactColumns | null {
  const keys = header.map(normalized);
  const exact = keys.findIndex((key) => EMAIL_HEADERS.includes(key));
  const loose = keys.findIndex(
    (key) => key.includes("email") && !/verified|status|opt|consent/.test(key),
  );
  const email = exact >= 0 ? exact : loose;
  if (email < 0) return null;
  const columns: ContactColumns = { email };
  for (const [field, names] of Object.entries(HEADERS)) {
    const index = keys.findIndex((key) => names.includes(key));
    if (index >= 0) columns[field as keyof typeof HEADERS] = index;
  }
  return columns;
}

/** "Ada Lovelace <ada@x.com>" → "ada@x.com"; plain addresses pass through. */
export function addressIn(value: string): string {
  const angled = value.match(/<([^<>]+)>/);
  return (angled?.[1] ?? value)
    .trim()
    .replace(/^mailto:/i, "")
    .toLowerCase();
}
