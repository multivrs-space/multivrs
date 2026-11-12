"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import {
  SegmentedControl,
  type SegmentOption,
} from "@/components/dashboard/SegmentedControl";
import type { MailMessageDetail } from "@/features/mail/mail.types";
import { blockRemoteContent } from "@/features/mail/reader/block-remote-content";
import {
  emailDocument,
  rawMessage,
  resolveEmailHtml,
} from "@/features/mail/reader/email-document";
import { MailAttachments } from "@/features/mail/reader/MailAttachments";
import { MailEmailFrame } from "@/features/mail/reader/MailEmailFrame";
import { RemoteImagesBar } from "@/features/mail/reader/RemoteImagesBar";

type Tab = "preview" | "text" | "html" | "raw";

const SOURCE =
  "max-h-[600px] min-h-[160px] overflow-auto p-5 font-geist-mono text-[12px] leading-relaxed text-muted-foreground select-text";

/** The message as the sender designed it, or its text, HTML and headers. */
export function MailMessageBody({ message }: { message: MailMessageDetail }) {
  const [tab, setTab] = useState<Tab>(message.html ? "preview" : "text");
  const [imagesAllowed, setImagesAllowed] = useState(false);
  const resolved = useMemo(
    () => resolveEmailHtml(message.html, message.attachments),
    [message.html, message.attachments],
  );
  const guarded = useMemo(() => blockRemoteContent(resolved), [resolved]);
  const hiding =
    Boolean(message.remoteImagesBlocked) &&
    !imagesAllowed &&
    guarded.blocked > 0;
  const html = hiding ? guarded.html : resolved;
  const raw = useMemo(() => rawMessage(message), [message]);
  const tabs: SegmentOption<Tab>[] = [
    { value: "preview", label: "Preview" },
    ...(message.text ? [{ value: "text" as const, label: "Text" }] : []),
    ...(message.html ? [{ value: "html" as const, label: "HTML" }] : []),
    { value: "raw", label: "Raw" },
  ];
  const copyText =
    tab === "html"
      ? (message.html ?? "")
      : tab === "raw"
        ? raw
        : (message.text ?? message.html ?? "");
  return (
    <div className="min-w-0">
      <div className="surface-inset overflow-hidden rounded-tile">
        <div className="flex items-center justify-between gap-2 border-b border-hairline px-2 py-1.5">
          <SegmentedControl
            aria-label="Message format"
            className="h-8 bg-transparent shadow-none"
            onChange={setTab}
            options={tabs}
            value={tab}
          />
          <CopyButton className="size-7" text={copyText} />
        </div>
        {tab === "preview" && hiding ? (
          <RemoteImagesBar
            count={guarded.blocked}
            onLoad={() => setImagesAllowed(true)}
          />
        ) : null}
        {tab === "preview" ? (
          <div className="min-h-[160px] bg-white p-5 text-neutral-900 sm:p-7">
            {message.html ? (
              <MailEmailFrame
                document={emailDocument(html, message.text)}
                title={`Email: ${message.subject}`}
              />
            ) : message.text ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.text}
              </p>
            ) : (
              <p className="text-sm italic text-neutral-500">
                This message has no readable body.
              </p>
            )}
          </div>
        ) : null}
        {tab === "text" ? (
          <p className="min-h-[160px] whitespace-pre-wrap p-5 text-[13.5px] leading-relaxed text-foreground/90">
            {message.text}
          </p>
        ) : null}
        {tab === "html" ? (
          <pre className={`${SOURCE} whitespace-pre-wrap`}>{message.html}</pre>
        ) : null}
        {tab === "raw" ? (
          <pre className={`${SOURCE} whitespace-pre`}>{raw}</pre>
        ) : null}
      </div>
      {message.attachments?.length ? (
        <MailAttachments attachments={message.attachments} />
      ) : null}
    </div>
  );
}
