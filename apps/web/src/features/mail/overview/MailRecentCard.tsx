"use client";

import { CardAction } from "@/components/dashboard/CardAction";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LiveInbox } from "@/components/icons/animated";
import { relativeTime } from "@/features/dashboard/lib/relative-time";
import { useMailContext, useMailData } from "@/features/mail/mail-context";
import { SenderAvatar } from "@/features/mail/SenderAvatar";
import { cn } from "@/lib/utils";

/** The newest conversations across every mailbox; each opens the inbox. */
export function MailRecentCard({ className }: { className?: string }) {
  const { setView } = useMailContext();
  const threads = useMailData().recentThreads;
  return (
    <DashCard aria-label="Recent conversations" className={className}>
      <DashCardHeader
        action={
          <CardAction label="Open the inbox" onClick={() => setView("inbox")} />
        }
        description="The latest activity in every mailbox"
        icon={LiveInbox}
        title="Recent conversations"
      />
      {threads.length ? (
        <ul className="p-2 pt-3">
          {threads.map((thread) => (
            <li key={thread.id}>
              <button
                className="flex w-full min-w-0 items-center gap-3 rounded-tile px-3 py-2.5 text-left outline-none transition-colors hover:bg-foreground/[0.03] focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setView("inbox")}
                type="button"
              >
                <SenderAvatar
                  address={thread.correspondent}
                  className="shrink-0"
                  name={thread.correspondentName}
                  size="md"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "truncate text-[13.5px]",
                        thread.unread
                          ? "font-semibold text-foreground"
                          : "font-medium text-foreground/85",
                      )}
                    >
                      {thread.correspondentName || thread.correspondent}
                    </span>
                    {thread.unread ? (
                      <span className="size-1.5 shrink-0 rounded-full bg-primary">
                        <span className="sr-only">Unread</span>
                      </span>
                    ) : null}
                    <span className="ml-auto shrink-0 text-[11.5px] text-muted-foreground">
                      {relativeTime(thread.lastMessageAt)}
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate text-[12.5px] text-muted-foreground">
                    <span className="text-foreground/80">{thread.subject}</span>
                    {thread.preview ? ` — ${thread.preview}` : null}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          className="flex-1"
          description="Messages to your mailboxes and replies to what you send land here."
          glyph={LiveInbox}
          title="No conversations yet"
        />
      )}
    </DashCard>
  );
}
