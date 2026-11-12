"use client";

import {
  LiveArchive,
  LiveArrowLeft,
  LiveChevronLeft,
  LiveChevronRight,
  LiveInbox,
  LiveMail,
  LiveMailOpen,
  LivePrinter,
  LiveShieldAlert,
  LiveStar,
  LiveTrash,
} from "@/components/icons/animated";
import type {
  MailMessageDetail,
  MailThreadSummary,
} from "@/features/mail/mail.types";
import { ReaderAction } from "@/features/mail/reader/ReaderAction";

interface MailReaderToolbarProps {
  thread: MailThreadSummary;
  latest?: MailMessageDetail;
  currentIndex?: number;
  totalThreads?: number;
  onAction: (messageId: string, action: string) => void;
  onNavigate?: (delta: -1 | 1) => void;
  onClose?: () => void;
}

/** Move, mark and step through conversations, keys shown in each tooltip. */
export function MailReaderToolbar({
  thread,
  latest,
  currentIndex,
  totalThreads,
  onAction,
  onNavigate,
  onClose,
}: MailReaderToolbarProps) {
  const act = (action: string) => () => latest && onAction(latest.id, action);
  return (
    <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-hairline px-3 sm:px-5">
      <div className="flex items-center gap-1">
        {onClose ? (
          <ReaderAction
            className="md:hidden"
            icon={LiveArrowLeft}
            label="Back to conversations"
            onClick={onClose}
          />
        ) : null}
        {latest ? (
          <>
            <div className="surface-inset flex items-center gap-0.5 rounded-full p-0.5">
              <ReaderAction
                icon={LiveArchive}
                label="Archive"
                onClick={act("archive")}
                shortcut="E"
              />
              <ReaderAction
                icon={LiveInbox}
                label="Move to inbox"
                onClick={act("inbox")}
              />
              <ReaderAction
                icon={LiveShieldAlert}
                label="Report spam"
                onClick={act("spam")}
              />
              <ReaderAction
                icon={LiveTrash}
                label="Delete"
                onClick={act("trash")}
              />
            </div>
            <ReaderAction
              icon={thread.unread ? LiveMailOpen : LiveMail}
              label={thread.unread ? "Mark as read" : "Mark as unread"}
              onClick={act(thread.unread ? "read" : "unread")}
            />
            <ReaderAction
              active={thread.starred}
              icon={LiveStar}
              label={thread.starred ? "Unstar" : "Star"}
              onClick={act(thread.starred ? "unstar" : "star")}
            />
          </>
        ) : null}
      </div>
      <div className="flex items-center gap-1">
        {totalThreads && currentIndex !== undefined ? (
          <>
            <span className="hidden px-1 font-geist-mono text-[11px] text-muted-foreground sm:inline">
              {currentIndex + 1} / {totalThreads}
            </span>
            <ReaderAction
              disabled={currentIndex <= 0}
              icon={LiveChevronLeft}
              label="Previous conversation"
              onClick={() => onNavigate?.(-1)}
              shortcut="K"
            />
            <ReaderAction
              disabled={currentIndex >= totalThreads - 1}
              icon={LiveChevronRight}
              label="Next conversation"
              onClick={() => onNavigate?.(1)}
              shortcut="J"
            />
          </>
        ) : null}
        <ReaderAction
          className="hidden sm:inline-flex"
          icon={LivePrinter}
          label="Print conversation"
          onClick={() => window.print()}
        />
      </div>
    </div>
  );
}
