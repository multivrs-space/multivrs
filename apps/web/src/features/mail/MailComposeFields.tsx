"use client";

import { useState } from "react";
import { LiveTriangleAlert } from "@/components/icons/animated";
import {
  ENVELOPE_FIELD,
  EnvelopeLine,
} from "@/features/mail/compose/EnvelopeLine";
import { ForwardedPreview } from "@/features/mail/compose/ForwardedPreview";
import { FromSelect } from "@/features/mail/compose/FromSelect";
import { MailAttachmentPicker } from "@/features/mail/MailAttachmentPicker";
import { MailRichEditor } from "@/features/mail/MailRichEditor";
import type {
  MailboxSummary,
  MailMessageDetail,
} from "@/features/mail/mail.types";

/** Who a reply goes to: the sender (or their Reply-To), or for your own message, its recipients. */
function replyRecipients(reply?: MailMessageDetail): string | undefined {
  if (!reply) return undefined;
  if (reply.direction === "outbound") return reply.to.join(", ");
  return reply.replyTo ?? reply.fromAddress;
}

/** The envelope as lines, like a mail client, then the body and files. */
export function MailComposeFields({
  forward,
  mailboxes,
  reply,
}: {
  forward?: MailMessageDetail;
  mailboxes: MailboxSummary[];
  reply?: MailMessageDetail;
}) {
  const [copies, setCopies] = useState(false);
  const subject = reply
    ? `Re: ${reply.subject}`
    : forward
      ? `Fwd: ${forward.subject}`
      : "";
  return (
    <div className="flex-1 overflow-y-auto">
      {mailboxes.length ? null : (
        <p
          className="mx-5 mt-4 flex items-center gap-2 rounded-tile border border-amber-500/25 bg-amber-500/[0.06] p-3 text-[12.5px] text-amber-800 dark:text-amber-200"
          data-icon-trigger
        >
          <LiveTriangleAlert className="size-4 shrink-0" strokeWidth={1.75} />
          Create a mailbox and verify its domain before sending.
        </p>
      )}
      <div className="divide-y divide-hairline border-b border-hairline">
        <EnvelopeLine htmlFor="compose-from" label="From">
          <FromSelect
            mailboxes={mailboxes}
            preferredId={(reply ?? forward)?.mailboxId}
          />
        </EnvelopeLine>
        <EnvelopeLine htmlFor="compose-to" label="To">
          <input
            className={ENVELOPE_FIELD}
            defaultValue={replyRecipients(reply)}
            id="compose-to"
            name="to"
            placeholder="person@example.com, teammate@example.com"
            required
          />
          {copies ? null : (
            <button
              className="shrink-0 rounded-full px-2 py-1 text-[12px] text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
              onClick={() => setCopies(true)}
              type="button"
            >
              Cc Bcc
            </button>
          )}
        </EnvelopeLine>
        <div className="divide-y divide-hairline" hidden={!copies}>
          <EnvelopeLine htmlFor="compose-cc" label="Cc">
            <input
              className={ENVELOPE_FIELD}
              id="compose-cc"
              name="cc"
              placeholder="Optional"
            />
          </EnvelopeLine>
          <EnvelopeLine htmlFor="compose-bcc" label="Bcc">
            <input
              className={ENVELOPE_FIELD}
              id="compose-bcc"
              name="bcc"
              placeholder="Optional"
            />
          </EnvelopeLine>
        </div>
        <EnvelopeLine htmlFor="compose-subject" label="Subject">
          <input
            className={`${ENVELOPE_FIELD} font-medium`}
            defaultValue={subject}
            id="compose-subject"
            name="subject"
            required
          />
        </EnvelopeLine>
      </div>
      <div className="space-y-3 p-4 sm:p-5">
        <MailRichEditor initialHtml="" />
        {forward ? <ForwardedPreview message={forward} /> : null}
        <MailAttachmentPicker />
      </div>
    </div>
  );
}
