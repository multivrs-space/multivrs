"use client";

import { LiveStar } from "@/components/icons/animated";
import { threadTime } from "@/features/mail/lib/thread-groups";
import type { MailThreadSummary } from "@/features/mail/mail.types";
import { SenderAvatar } from "@/features/mail/SenderAvatar";
import { resolveSenderDisplayName } from "@/features/mail/sender-utils";
import { cn } from "@/lib/utils";

interface MailThreadRowProps {
  thread: MailThreadSummary;
  selected: boolean;
  onSelect: (id: string) => void;
  onToggleStar?: (threadId: string, starred: boolean) => void;
}

/** One conversation: sender, subject and preview, unread and star at a glance. */
export function MailThreadRow({
  thread,
  selected,
  onSelect,
  onToggleStar,
}: MailThreadRowProps) {
  const sender = resolveSenderDisplayName(
    thread.correspondentName,
    thread.correspondent,
  );
  return (
    <div
      className={cn(
        "group relative flex items-start rounded-tile transition-[background-color,box-shadow]",
        selected ? "surface-raised" : "hover:bg-foreground/[0.03]",
      )}
    >
      {selected ? (
        <span
          aria-hidden="true"
          className="absolute inset-y-3 left-0 w-[3px] rounded-r-full bg-primary"
        />
      ) : null}
      <button
        aria-current={selected ? "true" : undefined}
        className="flex min-w-0 flex-1 items-start gap-3 rounded-tile py-3 pl-3 pr-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => onSelect(thread.id)}
        type="button"
      >
        <span className="relative mt-0.5 shrink-0">
          <SenderAvatar
            address={thread.correspondent}
            name={sender}
            size="md"
          />
          {thread.unread ? (
            <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-primary ring-2 ring-background">
              <span className="sr-only">Unread</span>
            </span>
          ) : null}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span
              className={cn(
                "truncate text-[13.5px]",
                thread.unread
                  ? "font-semibold text-foreground"
                  : "font-medium text-foreground/80",
              )}
            >
              {sender}
            </span>
            <time
              className="shrink-0 font-geist-mono text-[10.5px] text-muted-foreground"
              dateTime={thread.lastMessageAt}
            >
              {threadTime(thread.lastMessageAt)}
            </time>
          </span>
          <span
            className={cn(
              "mt-0.5 block truncate text-[12.5px]",
              thread.unread
                ? "font-medium text-foreground"
                : "text-foreground/70",
            )}
          >
            {thread.subject || "(no subject)"}
          </span>
          <span className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
            {thread.preview}
          </span>
          {thread.mailboxAddress ? (
            <span className="mt-1.5 inline-flex max-w-full items-center rounded-full bg-foreground/[0.06] px-2 py-px font-geist-mono text-[10.5px] text-muted-foreground">
              <span className="truncate">{thread.mailboxAddress}</span>
            </span>
          ) : null}
        </span>
      </button>
      {onToggleStar ? (
        <button
          aria-label={thread.starred ? "Unstar" : "Star"}
          aria-pressed={thread.starred}
          className={cn(
            "mr-1.5 mt-2.5 grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground opacity-0 outline-none transition-opacity hover:bg-foreground/5 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100",
            thread.starred && "text-amber-500 opacity-100",
          )}
          data-icon-trigger
          onClick={() => onToggleStar(thread.id, thread.starred)}
          type="button"
        >
          <LiveStar
            className={cn("size-3.5", thread.starred && "fill-amber-400")}
            strokeWidth={1.75}
          />
        </button>
      ) : null}
    </div>
  );
}
