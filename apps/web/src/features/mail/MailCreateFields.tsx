"use client";

import {
  AudienceChoice,
  FormArea,
  FormChoice,
  FormField,
} from "@/features/mail/MailFormControls";
import type { MailResources } from "@/features/mail/mail.types";
import type { CreateMailView } from "@/features/mail/mail-resource-form";

export function MailCreateFields({
  resources,
  view,
}: {
  resources: MailResources;
  view: CreateMailView;
}) {
  if (view === "domains")
    return (
      <div className="space-y-4">
        <FormField name="domain" placeholder="example.com" />
        <input name="kind" type="hidden" value="sending" />
        <div className="surface-inset rounded-tile px-4 py-3 text-[12.5px] leading-5 text-muted-foreground">
          If Multivrs runs this domain's DNS, the email records are added for
          you. Otherwise you'll get records to add at your DNS provider.
        </div>
      </div>
    );
  if (view === "mailboxes")
    return (
      <>
        <FormField name="name" placeholder="Support" />
        <FormField
          name="address"
          placeholder="support@example.com"
          type="email"
        />
        <FormChoice
          name="kind"
          options={["shared", "personal", "sending", "no-reply"]}
        />
      </>
    );
  if (view === "contacts")
    return (
      <>
        <FormField name="email" placeholder="person@example.com" type="email" />
        <FormField name="firstName" placeholder="First name" />
        <FormField name="lastName" placeholder="Last name" required={false} />
        <FormField
          name="tags"
          placeholder="customer, newsletter"
          required={false}
        />
        <AudienceChoice resources={resources} optional />
      </>
    );
  if (view === "audiences")
    return (
      <>
        <FormField name="name" placeholder="Product updates" />
        <FormField
          name="description"
          placeholder="Who belongs in this audience?"
          required={false}
        />
      </>
    );
  if (view === "templates")
    return (
      <>
        <FormField name="name" placeholder="Welcome email" />
        <FormField name="subject" placeholder="Welcome to Multivrs" />
        <FormArea name="body" placeholder="Write the reusable email body…" />
      </>
    );
  if (view === "broadcasts")
    return (
      <>
        <FormField name="name" placeholder="July launch" />
        <FormField name="subject" placeholder="What we shipped" />
        <FormField
          name="fromAddress"
          placeholder="team@example.com"
          type="email"
        />
        <AudienceChoice resources={resources} />
        <FormArea name="body" placeholder="Write the campaign email…" />
        <FormField name="scheduledAt" required={false} type="datetime-local" />
      </>
    );
  if (view === "automations")
    return (
      <>
        <FormField name="name" placeholder="Welcome sequence" />
        <FormField name="event" placeholder="contact.created" />
        <FormField name="template" placeholder="Welcome template" />
      </>
    );
  if (view === "credentials")
    return (
      <>
        <FormField name="name" placeholder="Production API" />
        <FormChoice name="kind" options={["api", "smtp"]} />
        <FormChoice name="mode" options={["test", "live"]} />
      </>
    );
  return (
    <>
      <FormField
        name="url"
        placeholder="https://example.com/webhooks/mail"
        type="url"
      />
      <FormField name="events" placeholder="email.delivered, email.bounced" />
    </>
  );
}
