import { describe, expect, test } from "bun:test";
import {
  addressIn,
  contactColumns,
  parseCsv,
} from "../../apps/web/src/features/mail/contacts/contact-csv";
import { mergeContactFiles } from "../../apps/web/src/features/mail/contacts/contact-merge";

describe("parseCsv", () => {
  test("quotes, doubled quotes, line breaks in quotes, CRLF and a BOM", () => {
    const rows = parseCsv('﻿email,note\r\n"a@x.com","say ""hi""\nthere"\r\n\r\nb@x.com,plain\r\n');
    expect(rows).toEqual([
      ["email", "note"],
      ["a@x.com", 'say "hi"\nthere'],
      ["b@x.com", "plain"],
    ]);
  });

  test("detects semicolon and tab separators", () => {
    expect(parseCsv("email;name\na@x.com;Ada")[1]).toEqual(["a@x.com", "Ada"]);
    expect(parseCsv("email\tname\na@x.com\tAda")[1]).toEqual(["a@x.com", "Ada"]);
  });
});

describe("contactColumns", () => {
  test("auth exports: primary email wins over verified/unverified lists", () => {
    const header = [
      "id",
      "first_name",
      "last_name",
      "verified_email_addresses",
      "primary_email_address",
      "unverified_email_addresses",
    ];
    expect(contactColumns(header)).toEqual({ email: 4, firstName: 1, lastName: 2 });
  });

  test("an exact email header beats one that mentions email", () => {
    expect(contactColumns(["Work email", "Email", "Full Name"])).toEqual({ email: 1, name: 2 });
  });

  test("no email column", () => {
    expect(contactColumns(["id", "phone"])).toBeNull();
  });
});

test("addressIn takes the address out of display forms", () => {
  expect(addressIn(" Ada <ADA@X.com> ")).toBe("ada@x.com");
  expect(addressIn("mailto:Bob@X.com")).toBe("bob@x.com");
});

describe("mergeContactFiles", () => {
  const first = {
    name: "app.csv",
    text: "email,first_name,last_name\nada@x.com,Ada,\nbob@x.com,Bob,Stone\nbroken,No,Email\n",
  };
  const second = {
    name: "store.csv",
    text: "Email Address;Full Name;Tags\nADA@x.com;Ada Lovelace;vip\ncy@x.com;Cy Twombly;new, vip\ncy@x.com;;later\n",
  };

  test("one contact per address across files, case-insensitive", () => {
    const merged = mergeContactFiles([first, second]);
    expect(merged.contacts.map((contact) => contact.email)).toEqual([
      "ada@x.com",
      "bob@x.com",
      "cy@x.com",
    ]);
    expect(merged.duplicates).toBe(2);
    expect(merged.invalid).toBe(1);
    expect(merged.files.map((file) => [file.name, file.contacts, file.invalid])).toEqual([
      ["app.csv", 2, 1],
      ["store.csv", 3, 0],
    ]);
  });

  test("later rows fill blanks without overwriting, tags add up", () => {
    const [ada, , cy] = mergeContactFiles([first, second]).contacts;
    expect(ada).toEqual({
      email: "ada@x.com",
      firstName: "Ada",
      lastName: "Lovelace",
      tags: ["vip"],
    });
    expect(cy).toEqual({
      email: "cy@x.com",
      firstName: "Cy",
      lastName: "Twombly",
      tags: ["new", "vip", "later"],
    });
  });

  test("files without a header row use the column of addresses", () => {
    const merged = mergeContactFiles([
      { name: "list.csv", text: "Ada,ada@x.com\nBob,bob@x.com\n" },
    ]);
    expect(merged.contacts.map((contact) => contact.email)).toEqual(["ada@x.com", "bob@x.com"]);
  });

  test("a file with no addresses is flagged, not silently empty", () => {
    const merged = mergeContactFiles([{ name: "phones.csv", text: "id,phone\n1,555\n" }]);
    expect(merged.files[0]?.unreadable).toBe(true);
    expect(merged.contacts).toEqual([]);
  });
});
