"use client";

import { useMemo } from "react";
import { LiveForward, LivePaperclip } from "@/components/icons/animated";
import type { MailMessageDetail } from "@/features/mail/mail.types";
import { blockRemoteContent } from "@/features/mail/reader/block-remote-content";
import {
  emailDocument,
  resolveEmailHtml,
} from "@/features/mail/reader/email-document";
import { MailEmailFrame } from "@/features/mail/reader/MailEmailFrame";

/**
 * The email being forwarded, read-only and exactly as it will be sent under
 * your note: layout, images and attachments intact. Remote images stay
 * blocked here, as in the reader, so opening a forward fires no trackers.
 */
export function ForwardedPreview({ message }: { message: MailMessageDetail }) {
  const html = useMemo(
    () =>
      message.html
        ? blockRemoteContent(
            resolveEmailHtml(message.html, message.attachments),
          ).html
        : "",
    [message.html, message.attachments],
  );
  const files = message.attachments?.filter((file) => !file.inline) ?? [];
  return (
    <section
      aria-label="Forwarded message"
      className="overflow-hidden rounded-tile border border-hairline"
    >
      <input name="forwardMessageId" type="hidden" value={message.id} />
      <header className="flex items-start gap-2.5 border-b border-hairline bg-foreground/[0.02] px-4 py-3">
        <LiveForward
          className="mt-0.5 size-4 shrink-0 text-primary"
          strokeWidth={1.75}
        />
        <div className="min-w-0 text-xs leading-relaxed">
          <p className="font-medium text-foreground">Forwarded as it is</p>
          <p className="truncate text-muted-foreground">
            From{" "}
            {message.fromName
              ? `${message.fromName} <${message.fromAddress}>`
              : message.fromAddress}
            {" · "}
            {message.subject}
          </p>
        </div>
      </header>
      <div className="max-h-[420px] overflow-auto bg-white p-4 text-neutral-900">
        {html ? (
          <MailEmailFrame
            document={emailDocument(html, message.text)}
            title={`Forwarded: ${message.subject}`}
          />
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.text}
          </p>
        )}
      </div>
      {files.length ? (
        <ul className="flex flex-wrap gap-2 border-t border-hairline px-4 py-3">
          {files.map((file) => (
            <li
              className="surface-inset flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] text-muted-foreground"
              key={file.id}
            >
              <LivePaperclip className="size-3" strokeWidth={2} />
              {file.filename}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
