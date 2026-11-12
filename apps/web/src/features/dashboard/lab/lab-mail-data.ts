import type { DnsRecordRow } from "@/features/mail/domain/mail-domain-checks";
import type {
  MailActivityDay,
  MailDashboardData,
  MailMessageDetail,
  MailResourceItem,
  MailResources,
  MailThreadSummary,
} from "@/features/mail/mail.types";

/* Synthetic mail for tuning visuals in the lab only. Product pages never
   render made-up numbers. */

const NOW = Date.UTC(2026, 9, 27, 12);
const ago = (hours: number) => new Date(NOW - hours * 3_600_000).toISOString();

export const LAB_ACTIVITY: MailActivityDay[] = Array.from(
  { length: 30 },
  (_, index) => {
    const sent = Math.round(180 + 120 * Math.sin(index / 3) + index * 9);
    const delivered = Math.round(sent * 0.97);
    return {
      day: new Date(NOW - (29 - index) * 86_400_000).toISOString().slice(0, 10),
      sent,
      received: Math.round(40 + 25 * Math.cos(index / 2)),
      delivered,
      opened: Math.round(delivered * (0.38 + (index % 4) * 0.03)),
      clicked: Math.round(delivered * 0.08),
      bounced: Math.round(sent * 0.012),
      complained: index % 9 === 0 ? 1 : 0,
    };
  },
);

export const LAB_THREADS: MailThreadSummary[] = [
  {
    id: "t1",
    mailboxId: "m",
    subject: "Invoice for October",
    status: "open",
    lastMessageAt: ago(1),
    unread: true,
    starred: false,
    preview: "Hi team, attached is the invoice for this month's usage.",
    correspondent: "billing@acme.com",
    correspondentName: "Acme Billing",
    latestMessageId: "msg1",
  },
  {
    id: "t2",
    mailboxId: "m",
    subject: "Re: DNS records for launch",
    status: "open",
    lastMessageAt: ago(5),
    unread: false,
    starred: true,
    preview: "The DKIM records are live now, can you check again?",
    correspondent: "ada@studio.dev",
    correspondentName: "Ada Obi",
    latestMessageId: "msg2",
  },
  {
    id: "t3",
    mailboxId: "m",
    subject: "Welcome to the beta",
    status: "open",
    lastMessageAt: ago(30),
    unread: false,
    starred: false,
    preview: "Thanks for signing up. Here is what to try first.",
    correspondent: "hello@product.io",
    latestMessageId: "msg3",
  },
  {
    id: "t4",
    mailboxId: "m",
    subject: "Quarterly review",
    status: "open",
    lastMessageAt: ago(24 * 9),
    unread: false,
    starred: false,
    preview: "Agenda and notes for next week's review.",
    correspondent: "kemi@company.ng",
    correspondentName: "Kemi A.",
    latestMessageId: "msg4",
  },
];

export const LAB_MESSAGES: MailMessageDetail[] = [
  {
    id: "msg0",
    mailboxId: "lab-mailbox",
    direction: "outbound",
    status: "delivered",
    folder: "sent",
    fromName: "You",
    fromAddress: "you@multivrs.app",
    to: ["ada@studio.dev"],
    cc: [],
    subject: "DNS records for launch",
    text: "Could you add the records from the dashboard?",
    createdAt: ago(28),
  },
  {
    id: "msg2",
    mailboxId: "lab-mailbox",
    direction: "inbound",
    status: "received",
    folder: "inbox",
    fromName: "Ada Obi",
    fromAddress: "ada@studio.dev",
    to: ["you@multivrs.app"],
    cc: [],
    subject: "Re: DNS records for launch",
    html: "<p>Hi,</p><p>The <b>DKIM</b> records are live now, can you check again?</p><p>Ada</p>",
    text: "Hi, the DKIM records are live now.",
    createdAt: ago(5),
    attachments: [
      {
        id: "a1",
        filename: "dns-export.csv",
        contentType: "text/csv",
        size: 2_340,
      },
    ],
  },
];

const item = (
  id: string,
  name: string,
  detail: string,
  status: string,
  hours = 48,
): MailResourceItem => ({ id, name, detail, status, createdAt: ago(hours) });

export const LAB_RESOURCES: MailResources = {
  domains: [
    item("d1", "studio.dev", "Sends and receives", "verified"),
    item("d2", "news.studio.dev", "Sends only", "pending", 3),
  ],
  contacts: [
    item("c1", "ada@studio.dev", "Ada Obi", "subscribed"),
    item("c2", "kemi@company.ng", "Kemi A.", "unsubscribed"),
  ],
  audiences: [item("au1", "Product updates", "1,204 contacts", "static")],
  templates: [item("tp1", "Welcome email", "Version 3", "published")],
  broadcasts: [
    item("b1", "October launch", "What we shipped this month", "sent", 200),
    item("b2", "Webinar invite", "Join us live on Thursday", "scheduled", 20),
    item("b3", "Holiday notes", "Draft", "draft", 2),
  ],
  automations: [item("au2", "Welcome series", "Version 2", "active")],
  credentials: [item("k1", "Production API", "mv_live_8f2a…9c1d", "live api")],
  webhooks: [item("w1", "https://studio.dev/hooks/mail", "4 events", "active")],
};

export const LAB_SHELL: MailDashboardData = {
  stats: { activeMailboxes: 3, verifiedDomains: 1, contacts: 1840 },
  folderCounts: { inbox: 4 },
  mailboxes: [
    {
      id: "m",
      address: "support@studio.dev",
      name: "Support",
      kind: "shared",
      status: "active",
    },
  ],
  recentThreads: LAB_THREADS,
};

const record = (
  purpose: string,
  type: string,
  name: string,
  value: string,
  status: string,
  priority: number | null = null,
): DnsRecordRow => ({
  id: purpose,
  purpose,
  type,
  name,
  value,
  ttl: "Auto",
  priority,
  status,
  managedByMultivrs: false,
});

export const LAB_DNS: DnsRecordRow[] = [
  record(
    "dkim-1",
    "CNAME",
    "abc._domainkey.studio.dev",
    "abc.dkim.amazonses.com",
    "verified",
  ),
  record(
    "dkim-2",
    "CNAME",
    "def._domainkey.studio.dev",
    "def.dkim.amazonses.com",
    "verified",
  ),
  record(
    "dkim-3",
    "CNAME",
    "ghi._domainkey.studio.dev",
    "ghi.dkim.amazonses.com",
    "found",
  ),
  record(
    "mx",
    "MX",
    "mail.studio.dev",
    "feedback-smtp.eu-west-1.amazonses.com",
    "verified",
    10,
  ),
  record(
    "spf",
    "TXT",
    "mail.studio.dev",
    "v=spf1 include:amazonses.com ~all",
    "verified",
  ),
  record("dmarc", "TXT", "_dmarc.studio.dev", "v=DMARC1; p=none;", "missing"),
  record(
    "inbound",
    "MX",
    "studio.dev",
    "inbound-smtp.eu-west-1.amazonaws.com",
    "missing",
    10,
  ),
];
