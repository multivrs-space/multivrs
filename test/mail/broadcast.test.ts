import { beforeAll, describe, expect, mock, test } from "bun:test";
import { contactColumns } from "../../apps/web/src/features/mail/contacts/contact-csv";
import { mergeContactFiles } from "../../apps/web/src/features/mail/contacts/contact-merge";
import {
  extraColumns,
  propertyKey,
} from "../../apps/web/src/features/mail/contacts/contact-properties";
import { broadcastHtml } from "../../apps/web/src/lib/mail/broadcast-html";
import { mergeValues, personalize } from "../../apps/web/src/lib/mail/personalize";
import { unsubscribeFooter } from "../../apps/web/src/lib/mail/unsubscribe-footer";

mock.module("server-only", () => ({}));

const ada = mergeValues({
  email: "ada@x.com",
  firstName: "Ada",
  lastName: null,
  properties: { Company: "Analytical <Engines>", plan: "pro", nested: { a: 1 } },
});

describe("personalize", () => {
  test("fills built-in tags and properties, any case, with fallbacks", () => {
    expect(
      personalize(
        "Hi {{ first_name }} {{last_name|friend}} at {{company}} ({{PLAN}})",
        ada,
        "text",
      ),
    ).toBe("Hi Ada friend at Analytical <Engines> (pro)");
  });

  test("escapes values in HTML so a name can't inject markup", () => {
    expect(personalize("<b>{{company}}</b>", ada, "html")).toBe(
      "<b>Analytical &lt;Engines&gt;</b>",
    );
  });

  test("unknown tags and objects become their fallback or nothing", () => {
    expect(
      personalize("[{{city}}][{{city|Lagos}}][{{nested}}][{{contact.email}}]", ada, "text"),
    ).toBe("[][Lagos][][ada@x.com]");
  });
});

test("plain bodies keep paragraphs and line breaks; HTML is untouched", () => {
  expect(broadcastHtml("Hi <you>,\nline two\n\nNew paragraph")).toBe(
    "<p>Hi &lt;you&gt;,<br>line two</p><p>New paragraph</p>",
  );
  expect(broadcastHtml("<table><tr><td>x</td></tr></table>")).toBe(
    "<table><tr><td>x</td></tr></table>",
  );
});

test("the unsubscribe footer escapes the sender and link", () => {
  const footer = unsubscribeFooter('Acme "News"', "https://multivrs.space/unsubscribe/a.b");
  expect(footer.html).toContain("Acme &quot;News&quot;");
  expect(footer.html).toContain('href="https://multivrs.space/unsubscribe/a.b"');
  expect(footer.text).toContain("Unsubscribe: https://multivrs.space/unsubscribe/a.b");
});

describe("unsubscribe tokens", () => {
  let tokens: typeof import("../../apps/web/src/lib/mail/unsubscribe-token");
  beforeAll(async () => {
    process.env.BETTER_AUTH_SECRET = "test-secret";
    tokens = await import("../../apps/web/src/lib/mail/unsubscribe-token");
  });

  test("name the contact and can't be edited to name another", () => {
    const token = tokens.unsubscribeToken("contact-1");
    expect(tokens.contactFromToken(token)).toBe("contact-1");
    const forged = token.replace("contact-1", "contact-2");
    expect(tokens.contactFromToken(forged)).toBeNull();
    expect(tokens.contactFromToken("contact-1")).toBeNull();
  });

  test("links always point at the live site", () => {
    const links = tokens.unsubscribeLinks("contact-1");
    expect(links.page).toStartWith("https://multivrs.space/unsubscribe/contact-1.");
    expect(links.oneClick).toStartWith("https://multivrs.space/api/mail/unsubscribe/contact-1.");
  });
});

describe("CSV columns kept as properties", () => {
  const header = [
    "id",
    "first_name",
    "primary_email_address",
    "password_digest",
    "totp_secret",
    "Company Name",
    "signupSource",
  ];

  test("secrets are never offered; others become clean keys", () => {
    const columns = contactColumns(header);
    expect(columns).not.toBeNull();
    const keys = extraColumns(header, columns ?? { email: 2 }).map((column) => column.key);
    expect(keys).toEqual(["id", "company_name", "signup_source"]);
    expect(propertyKey(" 2nd Plan! ")).toBe("nd_plan");
  });

  test("only the chosen columns are imported", () => {
    const text = `${header.join(",")}\n1,Ada,ada@x.com,$2b$hash,ABC,Acme,ads\n`;
    const none = mergeContactFiles([{ name: "a.csv", text }]);
    expect(none.contacts[0]?.properties).toBeUndefined();
    expect(none.columns.map((column) => column.key)).toEqual([
      "id",
      "company_name",
      "signup_source",
    ]);
    const kept = mergeContactFiles([{ name: "a.csv", text }], ["company_name"]);
    expect(kept.contacts[0]?.properties).toEqual({ company_name: "Acme" });
  });
});
