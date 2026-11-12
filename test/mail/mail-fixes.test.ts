import { describe, expect, test } from "bun:test";
import { mailboxGroups } from "../../apps/web/src/features/mail/lib/mailbox-groups";
import { forwardedContent } from "../../apps/web/src/lib/mail/forwarded-message";
import { providerIdsIn, publicMessageId } from "../../apps/web/src/lib/mail/public-message-id";

const original = {
  fromName: "Ada",
  fromAddress: "ada@example.com",
  toAddresses: ["hello@kontinueai.com"],
  ccAddresses: [],
  subject: "Invoice <May>",
  htmlBody: '<table style="width:600px"><tr><td style="color:#c00">Total</td></tr></table>',
  textBody: "Total",
  sentAt: null,
  receivedAt: new Date("2026-11-10T15:04:00Z"),
  createdAt: new Date("2026-11-10T15:04:00Z"),
};

describe("forwarding", () => {
  test("keeps the original HTML exactly, under the note and a header", () => {
    const { html, text } = forwardedContent(original, { html: "<p>See below</p>" });
    expect(html.startsWith("<p>See below</p>")).toBe(true);
    expect(html).toContain(original.htmlBody);
    expect(html).toContain("---------- Forwarded message ---------");
    expect(html).toContain("Subject: Invoice &lt;May&gt;");
    expect(text).toContain("From: Ada <ada@example.com>");
    expect(text).toContain("To: hello@kontinueai.com");
  });

  test("a plain-text original is kept as text, escaped", () => {
    const { html } = forwardedContent({ ...original, htmlBody: null, textBody: "a < b" }, {});
    expect(html).toContain("a &lt; b");
  });
});

describe("mailbox groups", () => {
  test("groups by domain, each sorted by name", () => {
    const groups = mailboxGroups([
      { address: "team@multivrs.space", name: "Team" },
      { address: "hello@kontinueai.com", name: "Kontinue AI" },
      { address: "contact@multivrs.space", name: "Contact" },
    ]);
    expect(groups.map((group) => group.domain)).toEqual(["kontinueai.com", "multivrs.space"]);
    expect(groups[1]?.mailboxes.map((mailbox) => mailbox.name)).toEqual(["Contact", "Team"]);
  });
});

describe("reply threading", () => {
  test("sent mail is known by the provider's Message-ID", () => {
    expect(
      publicMessageId({
        direction: "outbound",
        messageId: "<x@ours>",
        providerMessageId: "abc-123",
      }),
    ).toMatch(/^<abc-123@[a-z0-9.-]*amazonses\.com>$/);
    expect(
      publicMessageId({ direction: "inbound", messageId: "<their@id>", providerMessageId: null }),
    ).toBe("<their@id>");
  });

  test("finds provider ids in reply headers, any region", () => {
    expect(
      providerIdsIn([
        "<0100018abc@email.amazonses.com>",
        "<0200018def@eu-west-1.amazonses.com>",
        "<CAF123@mail.gmail.com>",
      ]),
    ).toEqual(["0100018abc", "0200018def"]);
  });
});
