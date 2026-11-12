"use client";

import { useState } from "react";
import {
  LiveChevronDown,
  LiveForward,
  LiveReply,
} from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import {
  fullTimestamp,
  relativeTime,
} from "@/features/dashboard/lib/relative-time";
import { MailMessageBody } from "@/features/mail/MailMessageBody";
import type { MailMessageDetail } from "@/features/mail/mail.types";
import { MailResourceStatus } from "@/features/mail/resources/MailResourceStatus";
import { SenderAvatar } from "@/features/mail/SenderAvatar";
import { resolveSenderDisplayName } from "@/features/mail/sender-utils";
import { cn } from "@/lib/utils";

interface MailMessageCardProps {
  message: MailMessageDetail;
  /** Earlier messages in a thread start folded to one line. */
  collapsible: boolean;
  onReply: (message: MailMessageDetail) => void;
  onForward: (message: MailMessageDetail) => void;
}

/** One message in a thread: who, when, the envelope on demand, the body. */
export function MailMessageCard({
  message,
  collapsible,
  onReply,
  onForward,
}: MailMessageCardProps) {
  const [open, setOpen] = useState(!collapsible);
  const [envelope, setEnvelope] = useState(false);
  const sender = resolveSenderDisplayName(
    message.fromName,
    message.fromAddress,
  );
  const rows = [
    [
      "From",
      message.fromName
        ? `${message.fromName} <${message.fromAddress}>`
        : message.fromAddress,
    ],
    ["To", message.to.join(", ") || "—"],
    ...(message.cc.length ? [["Cc", message.cc.join(", ")]] : []),
    ["Date", fullTimestamp(message.createdAt)],
    ["Subject", message.subject || "(no subject)"],
  ];
  return (
    <article className="surface-card overflow-hidden rounded-card">
      <header className="flex items-start gap-3 p-4 sm:p-5">
        <SenderAvatar address={message.fromAddress} name={sender} size="lg" />
        <div className="min-w-0 flex-1">
          <button
            className="flex w-full min-w-0 flex-wrap items-baseline gap-x-2 text-left disabled:cursor-default"
            disabled={!collapsible}
            onClick={() => setOpen((value) => !value)}
            type="button"
          >
            <span className="truncate text-[14.5px] font-semibold text-foreground">
              {sender}
            </span>
            <span className="hidden truncate text-[12px] text-muted-foreground sm:inline">
              {message.fromAddress}
            </span>
            <time
              className="ml-auto shrink-0 text-[12px] text-muted-foreground"
              dateTime={message.createdAt}
              title={fullTimestamp(message.createdAt)}
            >
              {relativeTime(message.createdAt)}
            </time>
          </button>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <button
              aria-expanded={envelope}
              className="inline-flex max-w-full items-center gap-1 rounded-md px-1 py-0.5 text-[12px] text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
              data-icon-trigger
              onClick={() => setEnvelope((value) => !value)}
              type="button"
            >
              <span className="truncate">
                to {message.to.join(", ") || "me"}
              </span>
              <LiveChevronDown
                className={cn(
                  "size-3 shrink-0 transition-transform",
                  envelope && "rotate-180",
                )}
                strokeWidth={2}
              />
            </button>
            <MailResourceStatus kind="orb" status={message.status} />
          </div>
          {envelope ? (
            <dl className="surface-inset mt-3 grid grid-cols-[64px_minmax(0,1fr)] gap-x-3 gap-y-1.5 rounded-tile p-3.5 text-[12px]">
              {rows.map(([label, value]) => (
                <div className="contents" key={label}>
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="break-all font-geist-mono text-foreground/90">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </header>
      {open ? (
        <>
          <div className="px-4 pb-4 sm:px-5">
            <MailMessageBody message={message} />
          </div>
          <footer className="flex items-center gap-1 border-t border-hairline px-3 py-2">
            <Button
              className="h-8 gap-1.5 rounded-full text-[12.5px]"
              data-icon-trigger
              onClick={() => onReply(message)}
              size="sm"
              variant="quiet"
            >
              <LiveReply className="size-3.5" strokeWidth={1.75} />
              Reply
            </Button>
            <Button
              className="h-8 gap-1.5 rounded-full text-[12.5px]"
              data-icon-trigger
              onClick={() => onForward(message)}
              size="sm"
              variant="quiet"
            >
              <LiveForward className="size-3.5" strokeWidth={1.75} />
              Forward
            </Button>
          </footer>
        </>
      ) : null}
    </article>
  );
}
