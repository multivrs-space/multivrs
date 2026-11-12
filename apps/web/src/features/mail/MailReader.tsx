"use client";

import { LiveForward, LiveReply } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { MailReaderSkeleton } from "@/features/mail/MailSkeletons";
import type {
  MailMessageDetail,
  MailThreadSummary,
} from "@/features/mail/mail.types";
import type { MailView } from "@/features/mail/mail-navigation";
import { MailMessageCard } from "@/features/mail/reader/MailMessageCard";
import { MailReaderEmpty } from "@/features/mail/reader/MailReaderEmpty";
import { MailReaderToolbar } from "@/features/mail/reader/MailReaderToolbar";
import { cn } from "@/lib/utils";

interface MailReaderProps {
  /** The open conversation's messages are still loading. */
  loading?: boolean;
  messages: MailMessageDetail[];
  onAction: (messageId: string, action: string) => void;
  onForward: (message: MailMessageDetail) => void;
  onReply: (message: MailMessageDetail) => void;
  thread?: MailThreadSummary;
  currentIndex?: number;
  totalThreads?: number;
  onNavigate?: (delta: -1 | 1) => void;
  onClose?: () => void;
  view?: MailView;
  className?: string;
}

/** The reading pane: toolbar, subject, then each message as its own card. */
export function MailReader({
  loading = false,
  messages,
  thread,
  view = "inbox",
  className,
  ...actions
}: MailReaderProps) {
  if (!thread) return <MailReaderEmpty className={className} />;
  if (loading) {
    return (
      <div className={cn("flex h-full min-h-0 flex-1 flex-col", className)}>
        <MailReaderSkeleton />
      </div>
    );
  }
  const latest = messages.at(-1);
  return (
    <section
      aria-label={thread.subject || "Conversation"}
      className={cn("flex h-full min-h-0 min-w-0 flex-1 flex-col", className)}
    >
      <MailReaderToolbar latest={latest} thread={thread} {...actions} />
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-6 lg:px-10 lg:py-8">
        <div className="mx-auto w-full max-w-4xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-geist-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                {view} · {messages.length}{" "}
                {messages.length === 1 ? "message" : "messages"}
              </p>
              <h1 className="mt-1.5 break-words text-[22px] font-semibold leading-tight tracking-[-0.025em] text-foreground sm:text-[26px]">
                {thread.subject || "(no subject)"}
              </h1>
            </div>
            {latest ? (
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  data-icon-trigger
                  onClick={() => actions.onReply(latest)}
                  size="sm"
                  variant="hero"
                >
                  <LiveReply strokeWidth={1.75} />
                  Reply
                </Button>
                <Button
                  className="hidden sm:inline-flex"
                  data-icon-trigger
                  onClick={() => actions.onForward(latest)}
                  size="sm"
                  variant="raised"
                >
                  <LiveForward strokeWidth={1.75} />
                  Forward
                </Button>
              </div>
            ) : null}
          </div>
          <div className="mt-6 space-y-3">
            {messages.map((message, index) => (
              <MailMessageCard
                collapsible={messages.length > 1 && index < messages.length - 1}
                key={message.id}
                message={message}
                onForward={actions.onForward}
                onReply={actions.onReply}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
