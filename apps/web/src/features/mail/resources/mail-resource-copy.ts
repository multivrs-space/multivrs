import type {
  MailResourceView,
  MailResourceViewConfig,
} from "@/features/mail/resources/mail-resource-views";

/** What each resource view says and how it lays out. */
export const MAIL_RESOURCE_COPY: Record<
  MailResourceView,
  Omit<MailResourceViewConfig, "title" | "icon">
> = {
  logs: {
    description:
      "Every message in and out, with the delivery state the provider reported.",
    layout: "rows",
    status: "orb",
    empty: "Messages appear here as soon as one is sent or received.",
  },
  broadcasts: {
    description:
      "Campaigns to an audience, drafted, scheduled and sent from here.",
    layout: "cards",
    status: "orb",
    empty: "Write a campaign once and send it to a whole audience.",
  },
  automations: {
    description:
      "Mail that sends itself when something happens, with versioned steps.",
    layout: "cards",
    status: "orb",
    empty: "Welcome series, receipts and nudges that run on events.",
  },
  templates: {
    description:
      "Reusable, versioned content for transactional and campaign mail.",
    layout: "cards",
    status: "orb",
    empty: "Save a layout once and send it from code or a broadcast.",
  },
  contacts: {
    description: "People you write to, with their consent state and history.",
    layout: "rows",
    mono: true,
    status: "orb",
    empty: "Add people by hand or import them, then group them into audiences.",
  },
  audiences: {
    description: "Groups of contacts to send campaigns to.",
    layout: "cards",
    status: "chip",
    empty: "Group contacts so a broadcast knows who to reach.",
  },
  domains: {
    description: "Domains you send from and receive at, verified through DNS.",
    layout: "rows",
    mono: true,
    status: "orb",
    deletable: true,
    empty:
      "Add a domain and publish its DNS records to send from your own address.",
  },
  mailboxes: {
    description: "Personal and shared addresses, each with a real inbox.",
    layout: "cards",
    status: "orb",
    deletable: true,
    empty: "Create an address like support@ and read its mail here.",
  },
  credentials: {
    description:
      "API keys and SMTP passwords. Secrets are shown once, when created.",
    layout: "rows",
    status: "chip",
    deletable: true,
    empty: "Create a key to send from your code or an SMTP client.",
  },
  webhooks: {
    description: "Signed events sent to your endpoints, with retries.",
    layout: "rows",
    mono: true,
    status: "orb",
    deletable: true,
    empty: "Point an endpoint at deliveries, opens and bounces as they happen.",
  },
};
