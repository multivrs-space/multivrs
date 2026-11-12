"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  emptyTrashRequest,
  updateMessage,
} from "@/features/mail/list/mailbox-actions";
import { useMailShortcuts } from "@/features/mail/list/useMailShortcuts";
import { MailReader } from "@/features/mail/MailReader";
import { MailThreadListSkeleton } from "@/features/mail/MailSkeletons";
import { MailThreadList } from "@/features/mail/MailThreadList";
import type {
  MailMessageDetail,
  MailThreadSummary,
} from "@/features/mail/mail.types";
import {
  useMailThread,
  useMailThreads,
} from "@/features/mail/mail-data.client";
import type { MailView } from "@/features/mail/mail-navigation";

export function MailboxView({
  onReply,
  onForward,
  projectId,
  query,
  view,
}: {
  onReply: (message: MailMessageDetail) => void;
  onForward: (message: MailMessageDetail) => void;
  projectId?: string;
  query: string;
  view: MailView;
}) {
  const router = useRouter();
  const list = useMailThreads(view, query);
  const [locallyReadThreadIds, setLocallyReadThreadIds] = useState<Set<string>>(
    () => new Set(),
  );
  const threads: MailThreadSummary[] = list.threads.map((thread) =>
    locallyReadThreadIds.has(thread.id) ? { ...thread, unread: false } : thread,
  );

  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const params = useParams<{ username?: string }>();
  const selected = threads.find((thread) => thread.id === selectedId);
  const conversation = useMailThread(selected?.id);
  const messages = conversation.messages ?? [];
  const latestLoaded = messages[messages.length - 1];

  const currentIndex = selected
    ? threads.findIndex((t) => t.id === selected.id)
    : -1;

  /** Folder counts live on the server; lists and the open thread are client-side. */
  const refresh = useCallback(() => {
    router.refresh();
    void list.refresh();
    void conversation.refresh();
  }, [conversation, list, router]);

  const action = useCallback(
    async (messageId: string, mailAction: string, quiet = false) => {
      try {
        await updateMessage(messageId, mailAction);
        if (!quiet) toast.success("Conversation updated");
        refresh();
      } catch {
        toast.error("Email action failed");
      }
    },
    [refresh],
  );

  const openThread = useCallback(
    (threadId: string) => {
      setSelectedId(threadId);
      const thread = threads.find((item) => item.id === threadId);
      if (!thread?.unread || !thread.latestMessageId) return;
      setLocallyReadThreadIds((current) => {
        const next = new Set(current);
        next.add(threadId);
        return next;
      });
      void updateMessage(thread.latestMessageId, "read").catch(() => {
        setLocallyReadThreadIds((current) => {
          const next = new Set(current);
          next.delete(threadId);
          return next;
        });
        toast.error("Email action failed");
      });
    },
    [threads],
  );

  const handleNavigate = useCallback(
    (delta: -1 | 1) => {
      if (!threads.length) return;
      if (currentIndex === -1) {
        if (threads[0]) openThread(threads[0].id);
        return;
      }
      const nextThread = threads[currentIndex + delta];
      if (nextThread) {
        openThread(nextThread.id);
      }
    },
    [currentIndex, openThread, threads],
  );

  const handleToggleStar = useCallback(
    async (threadId: string, starred: boolean) => {
      const latestId = threads.find(
        (item) => item.id === threadId,
      )?.latestMessageId;
      if (latestId) await action(latestId, starred ? "unstar" : "star");
    },
    [action, threads],
  );

  useMailShortcuts({
    next: () => handleNavigate(1),
    previous: () => handleNavigate(-1),
    reply: selected && latestLoaded ? () => onReply(latestLoaded) : undefined,
    archive: selected?.latestMessageId
      ? () => void action(selected.latestMessageId as string, "archive")
      : undefined,
  });

  async function emptyTrash() {
    setConfirmEmpty(false);
    const ok = await emptyTrashRequest(
      projectId
        ? { projectId }
        : params.username
          ? { account: params.username }
          : {},
    );
    if (!ok) return void toast.error("Trash could not be emptied");
    toast.success("Trash emptied");
    refresh();
  }

  if (list.loading) return <MailThreadListSkeleton view={view} />;

  return (
    <div className="flex h-(--dash-content-h) max-h-(--dash-content-h) min-h-0 w-full overflow-hidden bg-ink">
      <MailThreadList
        className={selectedId ? "hidden md:flex" : "flex"}
        hasMore={list.hasMore}
        loadingMore={list.loadingMore}
        onEmptyTrash={
          view === "trash" && threads.length
            ? () => setConfirmEmpty(true)
            : undefined
        }
        onLoadMore={list.loadMore}
        onRefresh={refresh}
        onSelect={openThread}
        onToggleStar={handleToggleStar}
        selectedId={selected?.id}
        threads={threads}
        view={view}
      />
      <MailReader
        className={selectedId ? "flex" : "hidden md:flex"}
        currentIndex={currentIndex}
        loading={Boolean(selected) && conversation.loading}
        messages={messages}
        onAction={action}
        onClose={() => setSelectedId(undefined)}
        onForward={onForward}
        onNavigate={handleNavigate}
        onReply={onReply}
        thread={selected}
        totalThreads={threads.length}
        view={view}
      />
      <ConfirmDialog
        confirmLabel="Empty Trash"
        description="Every message in Trash is permanently deleted. This can't be undone."
        onConfirm={() => void emptyTrash()}
        onOpenChange={setConfirmEmpty}
        open={confirmEmpty}
        title="Empty Trash?"
      />
    </div>
  );
}
