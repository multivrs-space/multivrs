"use client";

import { useEffect, useRef } from "react";
import { LiveRefresh, LiveTrash } from "@/components/icons/animated";
import { groupThreads } from "@/features/mail/lib/thread-groups";
import { MailFolderEmpty } from "@/features/mail/list/MailFolderEmpty";
import { MailThreadRow } from "@/features/mail/list/MailThreadRow";
import { MailThreadRowsSkeleton } from "@/features/mail/MailSkeletons";
import type { MailThreadSummary } from "@/features/mail/mail.types";
import {
  MAIL_NAVIGATION,
  type MailView,
} from "@/features/mail/mail-navigation";
import { ReaderAction } from "@/features/mail/reader/ReaderAction";
import { cn } from "@/lib/utils";

interface MailThreadListProps {
  /** More threads exist past the loaded pages. */
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  onSelect: (id: string) => void;
  onEmptyTrash?: () => void;
  onRefresh: () => void;
  onToggleStar?: (threadId: string, currentStarred: boolean) => void;
  selectedId?: string;
  threads: MailThreadSummary[];
  view?: MailView;
  className?: string;
}

/** A folder's conversations grouped by day, loading more as you scroll. */
export function MailThreadList({
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  onSelect,
  onEmptyTrash,
  onRefresh,
  onToggleStar,
  selectedId,
  threads,
  view = "inbox",
  className,
}: MailThreadListProps) {
  const folder = MAIL_NAVIGATION.find(
    (item) => "view" in item && item.view === view,
  );
  const title = folder && "label" in folder ? folder.label : "Conversations";
  const FolderIcon = folder && "icon" in folder ? folder.icon : null;
  const unread = threads.filter((thread) => thread.unread).length;
  const sentinel = useRef<HTMLDivElement>(null);

  // Load the next page as the end of the list scrolls into view.
  useEffect(() => {
    const element = sentinel.current;
    if (!element || !hasMore || !onLoadMore) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.some((entry) => entry.isIntersecting) && onLoadMore(),
      { rootMargin: "400px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full flex-col border-r border-hairline bg-ink md:w-[340px] md:shrink-0 lg:w-[380px]",
        className,
      )}
    >
      <div
        className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-hairline pl-4 pr-2"
        data-icon-trigger
      >
        <div className="flex min-w-0 items-center gap-2">
          {FolderIcon ? (
            <FolderIcon
              className="size-4 text-muted-foreground"
              strokeWidth={1.75}
            />
          ) : null}
          <h2 className="truncate text-[15px] font-semibold tracking-[-0.015em] text-foreground">
            {title}
          </h2>
          <span className="surface-inset rounded-full px-2 py-0.5 font-geist-mono text-[10.5px] text-muted-foreground">
            {unread
              ? `${unread} unread`
              : `${threads.length}${hasMore ? "+" : ""}`}
          </span>
        </div>
        <div className="flex items-center">
          <ReaderAction
            icon={LiveRefresh}
            label="Refresh"
            onClick={onRefresh}
          />
          {onEmptyTrash ? (
            <ReaderAction
              className="text-rose-600 dark:text-rose-400"
              icon={LiveTrash}
              label="Empty trash"
              onClick={onEmptyTrash}
            />
          ) : null}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {groupThreads(threads).map((group) => (
          <section aria-label={group.label} key={group.label}>
            <h3 className="sticky top-0 z-10 bg-ink/90 px-2 pb-1.5 pt-3 font-geist-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground backdrop-blur">
              {group.label}
            </h3>
            <div className="space-y-0.5">
              {group.threads.map((thread) => (
                <MailThreadRow
                  key={thread.id}
                  onSelect={onSelect}
                  onToggleStar={onToggleStar}
                  selected={selectedId === thread.id}
                  thread={thread}
                />
              ))}
            </div>
          </section>
        ))}
        {hasMore ? (
          <div ref={sentinel}>
            {loadingMore ? <MailThreadRowsSkeleton count={3} /> : null}
          </div>
        ) : null}
        {threads.length ? null : (
          <MailFolderEmpty icon={FolderIcon} title={title} />
        )}
      </div>
    </div>
  );
}
