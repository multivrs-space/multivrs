export interface MailboxSummary {
  id: string;
  address: string;
  name: string;
  kind: string;
  status: string;
}

export interface MailThreadSummary {
  id: string;
  mailboxId: string;
  /** Which of your mailboxes the conversation is in, e.g. hello@kontinueai.com. */
  mailboxAddress?: string;
  subject: string;
  status: string;
  assignedTo?: string;
  lastMessageAt: string;
  /** The newest message: what read, star, and archive act on from the list. */
  latestMessageId?: string;
  unread: boolean;
  starred: boolean;
  preview: string;
  correspondent: string;
  correspondentName?: string;
}

export interface MailAttachmentItem {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  contentBase64?: string;
  inline?: boolean;
  contentId?: string;
}

export interface MailMessageDetail {
  id: string;
  /** The mailbox it sits in: where a reply or forward is sent from. */
  mailboxId: string;
  /** Where the sender asked replies to go, when it isn't their address. */
  replyTo?: string;
  direction: string;
  status: string;
  folder: string;
  fromName?: string;
  fromAddress: string;
  to: string[];
  cc: string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: MailAttachmentItem[];
  /** Received mail hides remote images until the reader loads them. */
  remoteImagesBlocked?: boolean;
  sentAt?: string;
  receivedAt?: string;
  createdAt: string;
}

export interface MailResourceItem {
  id: string;
  name: string;
  detail: string;
  status: string;
  createdAt: string;
  /** Mailboxes only: its address, and who sees it (personal, shared, sending, no-reply). */
  address?: string;
  kind?: string;
}

/** One page of a thread list; `nextCursor` loads the page after it. */
export interface MailThreadPage {
  threads: MailThreadSummary[];
  nextCursor: string | null;
}

/** One page of the email log. */
export interface MailLogPage {
  items: MailResourceItem[];
  nextCursor: string | null;
}

/**
 * What every mail page shares and needs quickly: counts, mailboxes, and the
 * few latest conversations for the overview. Resource lists (`MailResources`)
 * stream separately; thread lists and message bodies load per view.
 */
export interface MailDashboardData {
  /** Volume and rates live in `MailActivityDay`, which streams separately. */
  stats: {
    activeMailboxes: number;
    verifiedDomains: number;
    contacts: number;
  };
  folderCounts: Record<string, number>;
  mailboxes: MailboxSummary[];
  recentThreads: MailThreadSummary[];
}

/** One UTC day of mail: messages each way, then what providers reported. */
export interface MailActivityDay {
  /** YYYY-MM-DD. */
  day: string;
  sent: number;
  received: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
}

export interface ContactProperty {
  key: string;
  /** Contacts that have a value for it. */
  contacts: number;
  example: string;
}

export interface AudienceSummary {
  total: number;
  subscribed: number;
  unsubscribed: number;
  properties: ContactProperty[];
}

/** The account's mail resources, for the resource pages and their forms. */
export interface MailResources {
  /** Contact totals and custom properties, for the Audience page and broadcasts. */
  audience: AudienceSummary;
  domains: MailResourceItem[];
  contacts: MailResourceItem[];
  audiences: MailResourceItem[];
  templates: MailResourceItem[];
  broadcasts: MailResourceItem[];
  automations: MailResourceItem[];
  credentials: MailResourceItem[];
  webhooks: MailResourceItem[];
}
