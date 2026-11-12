import { describe, expect, test } from "bun:test";
import {
  checkTone,
  domainChecks,
  recordStatus,
} from "../../apps/web/src/features/mail/domain/mail-domain-checks";
import {
  activityBuckets,
  busiestDay,
  mailHealth,
  rateOf,
  totalActivity,
} from "../../apps/web/src/features/mail/lib/mail-metrics";
import { groupThreads, threadTime } from "../../apps/web/src/features/mail/lib/thread-groups";
import type {
  MailActivityDay,
  MailThreadSummary,
} from "../../apps/web/src/features/mail/mail.types";
import { MAIL_NAVIGATION } from "../../apps/web/src/features/mail/mail-navigation";
import { blockRemoteContent } from "../../apps/web/src/features/mail/reader/block-remote-content";
import {
  type MailResourceView,
  mailResourceView,
  mailStatusTone,
  statusLabel,
} from "../../apps/web/src/features/mail/resources/mail-resource-views";

const day = (date: string, values: Partial<MailActivityDay> = {}): MailActivityDay => ({
  day: date,
  sent: 0,
  received: 0,
  delivered: 0,
  opened: 0,
  clicked: 0,
  bounced: 0,
  complained: 0,
  ...values,
});

const thread = (id: string, lastMessageAt: string): MailThreadSummary => ({
  id,
  mailboxId: "m",
  subject: id,
  status: "open",
  lastMessageAt,
  unread: false,
  starred: false,
  preview: "",
  correspondent: "a@example.com",
});

const record = (purpose: string, status: string, managedByMultivrs = false) => ({
  id: purpose,
  purpose,
  type: "TXT",
  name: purpose,
  value: "v",
  ttl: "Auto",
  priority: null,
  status,
  managedByMultivrs,
});

describe("mail metrics", () => {
  const days = [
    day("2026-10-01", { sent: 100, delivered: 98, opened: 40, bounced: 2 }),
    day("2026-10-02", { sent: 300, delivered: 290, opened: 120, complained: 1 }),
  ];

  test("totals add every day", () => {
    expect(totalActivity(days)).toMatchObject({
      sent: 400,
      delivered: 388,
      opened: 160,
      bounced: 2,
      complained: 1,
    });
  });

  test("rates are null with nothing sent and never pass 100", () => {
    expect(rateOf(5, 0)).toBeNull();
    expect(rateOf(12, 10)).toBe(100);
    expect(rateOf(1, 4)).toBe(25);
  });

  test("buckets carry sent volume and the day's open rate", () => {
    const [first] = activityBuckets(days);
    expect(first?.value).toBe(100);
    expect(first?.rate).toBeCloseTo((40 / 98) * 100);
    expect(first?.label).toBe("Oct 1");
  });

  test("health follows the SES review thresholds", () => {
    expect(mailHealth(totalActivity([]))).toBe("quiet");
    expect(mailHealth(totalActivity([day("d", { sent: 1000, bounced: 10 })]))).toBe("good");
    expect(mailHealth(totalActivity([day("d", { sent: 1000, bounced: 30 })]))).toBe("watch");
    expect(mailHealth(totalActivity([day("d", { sent: 1000, complained: 1 })]))).toBe("risk");
  });

  test("the busiest day is named, or nothing when quiet", () => {
    expect(busiestDay(days)).toContain("300 sent");
    expect(busiestDay([day("2026-10-01")])).toBeNull();
  });
});

describe("thread groups", () => {
  const now = new Date(2026, 9, 27, 15, 0);
  test("groups by recency, newest first", () => {
    const groups = groupThreads(
      [
        thread("a", new Date(2026, 9, 27, 9).toISOString()),
        thread("b", new Date(2026, 9, 26, 22).toISOString()),
        thread("c", new Date(2026, 9, 23, 10).toISOString()),
        thread("d", new Date(2026, 8, 2).toISOString()),
        thread("e", new Date(2025, 11, 2).toISOString()),
      ],
      now,
    );
    expect(groups.map((group) => group.label)).toEqual([
      "Today",
      "Yesterday",
      "This week",
      "September",
      "December 2025",
    ]);
  });

  test("times read as a clock today and a date otherwise", () => {
    expect(threadTime(new Date(2026, 9, 27, 9, 5).toISOString(), now)).toMatch(/9:05/);
    expect(threadTime(new Date(2026, 2, 3).toISOString(), now)).toBe("Mar 3");
  });
});

describe("mail resource views", () => {
  const views: MailResourceView[] = [
    "logs",
    "broadcasts",
    "automations",
    "templates",
    "contacts",
    "audiences",
    "domains",
    "mailboxes",
    "credentials",
    "webhooks",
  ];

  test("every resource view has a title and icon from the mail navigation", () => {
    for (const view of views) {
      const config = mailResourceView(view);
      const nav = MAIL_NAVIGATION.find((item) => "view" in item && item.view === view);
      expect(nav && "label" in nav ? nav.label : "").toBe(config.title);
      expect(config.icon.parts.length).toBeGreaterThan(0);
    }
  });

  test("only views with a delete endpoint offer delete", () => {
    expect(views.filter((view) => mailResourceView(view).deletable).sort()).toEqual([
      "credentials",
      "domains",
      "mailboxes",
      "webhooks",
    ]);
  });

  test("statuses map to tones and read as words", () => {
    expect(mailStatusTone("verified")).toBe("ready");
    expect(mailStatusTone("scheduled")).toBe("queued");
    expect(mailStatusTone("bounced")).toBe("error");
    expect(mailStatusTone("draft")).toBe("idle");
    expect(statusLabel("live api")).toBe("Live API");
  });
});

describe("mail domain checks", () => {
  const records = [
    record("dkim-1", "verified"),
    record("dkim-2", "verified"),
    record("dkim-3", "found"),
    record("mx", "verified"),
    record("spf", "verified"),
    record("dmarc", "missing"),
    record("inbound", "missing"),
    record("bimi", "missing"),
  ];
  const checks = domainChecks(records, "inbound");

  test("counts verified records per check and ignores BIMI", () => {
    expect(checks.map((check) => [check.key, check.verified, check.total])).toEqual([
      ["dkim", 2, 3],
      ["spf", 2, 2],
      ["dmarc", 0, 1],
      ["receiving", 0, 1],
    ]);
  });

  test("optional receiving reads as off, not waiting", () => {
    expect(checks.map(checkTone)).toEqual(["building", "ready", "building", "idle"]);
  });

  test("record labels: optional MX, managed records", () => {
    expect(recordStatus(record("inbound", "missing"), "inbound", false).label).toBe(
      "Add to receive",
    );
    expect(recordStatus(record("dmarc", "missing"), "inbound", false).tone).toBe("error");
    expect(recordStatus(record("dmarc", "missing", true), "inbound", true).label).toBe("Managed");
  });
});

describe("remote content in received mail", () => {
  test("remote images, srcsets and backgrounds stop loading", () => {
    const { html, blocked } = blockRemoteContent(
      `<img src="https://t.example.com/open.gif" width="1"><img srcset="//cdn.x/a.png 1x, //cdn.x/b.png 2x"><td background="http://x/bg.png">`,
    );
    expect(blocked).toBe(3);
    expect(html).not.toMatch(/\s(src|srcset|background)=/);
    expect(html).toContain('data-blocked-src="https://t.example.com/open.gif"');
  });

  test("data: and resolved inline images still show", () => {
    const source = `<img src="data:image/png;base64,AAAA"><img src="cid:logo">`;
    expect(blockRemoteContent(source)).toEqual({ html: source, blocked: 0 });
  });

  test("CSS url() and @import are neutralised, links are kept", () => {
    const { html, blocked } = blockRemoteContent(
      `<style>@import url("https://fonts.x/a.css"); .a{background:url(https://x/p.png) no-repeat}</style><div style="background-image:url(&quot;//x/y.png&quot;)"><a href="https://example.com">read</a></div>`,
    );
    expect(blocked).toBe(3);
    expect(html).not.toMatch(/url\(/);
    expect(html).toContain('href="https://example.com"');
  });

  test("SVG use and image hrefs are blocked", () => {
    const { blocked } = blockRemoteContent(
      `<svg><use href="https://x/sprite.svg#a"></use><image xlink:href="//x/i.png"></image></svg>`,
    );
    expect(blocked).toBe(2);
  });
});
