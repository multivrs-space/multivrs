import { z } from "zod";
import { hostnameSchema } from "@/lib/domains/dns.schemas";
import { mailAddressSchema } from "@/lib/schemas/mail-message.schemas";

/** The account (username) a request works in; the sender's own by default. */
const account = z.string().trim().min(1).max(100).optional();

export const createMailboxSchema = z.object({
  account,
  address: mailAddressSchema,
  name: z.string().trim().min(1).max(120),
  kind: z.enum(["personal", "shared", "sending", "no-reply"]),
  projectId: z.uuid().optional(),
});

/** What can change on a mailbox; the address is fixed (it's wired to DNS and routing). */
export const updateMailboxSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    kind: z.enum(["personal", "shared", "sending", "no-reply"]).optional(),
  })
  .refine((value) => value.name !== undefined || value.kind !== undefined, {
    message: "Change the name or the kind",
  });

export const createMailDomainSchema = z.object({
  account,
  domain: hostnameSchema,
  kind: z.enum(["sending", "mailbox", "tracking", "return-path"]),
  projectId: z.uuid().optional(),
});

export const createMailContactSchema = z.object({
  account,
  email: mailAddressSchema,
  firstName: z.string().trim().max(120).optional(),
  lastName: z.string().trim().max(120).optional(),
  tags: z.array(z.string().trim().min(1).max(64)).max(30).default([]),
  audienceIds: z.array(z.uuid()).max(50).default([]),
});

/** Custom facts about a contact (company, plan), used as merge tags. */
const contactPropertiesSchema = z
  .record(z.string().regex(/^[a-z][a-z0-9_]{0,39}$/), z.string().max(500))
  .refine((value) => Object.keys(value).length <= 50, {
    message: "A contact can have up to 50 properties",
  });

/** Most contacts one import request carries; the dashboard sends batches. */
export const CONTACT_IMPORT_BATCH = 1_000;

/**
 * A batch of contacts from uploaded files. The sender confirms these people
 * agreed to hear from them; anyone who unsubscribed stays unsubscribed.
 */
export const importMailContactsSchema = z.object({
  account,
  contacts: z
    .array(
      createMailContactSchema
        .omit({ account: true, audienceIds: true })
        .extend({ properties: contactPropertiesSchema.optional() }),
    )
    .min(1)
    .max(CONTACT_IMPORT_BATCH),
  audienceId: z.uuid().optional(),
  tags: z.array(z.string().trim().min(1).max(64)).max(30).default([]),
  consent: z.literal(true, {
    error: "Confirm these contacts agreed to receive email from you",
  }),
});

export const createMailAudienceSchema = z.object({
  account,
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(500).optional(),
});

export const createMailTemplateSchema = z.object({
  account,
  name: z.string().trim().min(1).max(160),
  projectId: z.uuid().optional(),
  subject: z.string().trim().min(1).max(998),
  previewText: z.string().trim().max(300).optional(),
  html: z.string().min(1).max(2_000_000),
  text: z.string().max(2_000_000).optional(),
  variables: z
    .array(z.string().regex(/^[a-zA-Z0-9_.]+$/))
    .max(100)
    .default([]),
});

export const createMailBroadcastSchema = z.object({
  account,
  name: z.string().trim().min(1).max(160),
  subject: z.string().trim().min(1).max(998),
  fromAddress: mailAddressSchema,
  /** A segment; left out, it goes to every subscribed contact. */
  audienceId: z.uuid().optional(),
  templateVersionId: z.uuid().optional(),
  body: z.string().min(1).max(2_000_000),
  projectId: z.uuid().optional(),
  scheduledAt: z.iso.datetime().optional(),
  /** Save it without sending. */
  draft: z.boolean().optional(),
});

export const createMailAutomationSchema = z.object({
  account,
  name: z.string().trim().min(1).max(160),
  projectId: z.uuid().optional(),
  trigger: z.record(z.string(), z.json()),
  steps: z.array(z.record(z.string(), z.json())).min(1).max(100),
});

export const createMailCredentialSchema = z.object({
  account,
  name: z.string().trim().min(1).max(120),
  kind: z.enum(["api", "smtp"]),
  mode: z.enum(["test", "live"]),
  projectId: z.uuid().optional(),
  permissions: z.array(z.string().min(1).max(100)).min(1).max(50),
});

export const createMailWebhookSchema = z.object({
  account,
  url: z
    .url()
    .refine((value) => value.startsWith("https://"), "HTTPS is required"),
  projectId: z.uuid().optional(),
  events: z.array(z.string().min(1).max(100)).min(1).max(50),
});
