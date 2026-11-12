import type { MailView } from "@/features/mail/mail-view";

/**
 * Loading states for the mail client. Each mirrors the layout it stands in
 * for, so content lands in place instead of jumping.
 */

const ROWS = ["a", "b", "c", "d", "e", "f", "g", "h"];

const LIST_TITLES: Partial<Record<MailView, string>> = {
  inbox: "Inbox",
  starred: "Starred",
  sent: "Sent",
  drafts: "Drafts",
  archive: "Archive",
  spam: "Spam",
  trash: "Trash",
};

/** Rows shaped like MailThreadRow: avatar, sender and time, subject, preview. */
export function MailThreadRowsSkeleton({
  count = ROWS.length,
}: {
  count?: number;
}) {
  return (
    <div aria-hidden="true" className="space-y-0.5">
      {ROWS.slice(0, count).map((row) => (
        <div className="flex items-start gap-3 px-3 py-3" key={row}>
          <span className="skeleton mt-0.5 size-8 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex justify-between gap-2">
              <span className="skeleton h-3 w-28" />
              <span className="skeleton h-2.5 w-10" />
            </div>
            <span className="skeleton block h-2.5 w-3/4" />
            <span className="skeleton block h-2.5 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** A folder (Inbox, Starred, Sent…): the list pane beside an empty reader. */
export function MailThreadListSkeleton({ view }: { view: MailView }) {
  return (
    <div
      aria-busy
      aria-label="Loading conversations"
      className="flex h-(--dash-content-h) w-full overflow-hidden bg-ink"
      role="status"
    >
      <div className="flex h-full w-full flex-col border-r border-hairline md:w-[340px] md:shrink-0 lg:w-[380px]">
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-hairline px-4">
          <h2 className="text-[15px] font-semibold tracking-[-0.015em] text-foreground">
            {LIST_TITLES[view] ?? "Conversations"}
          </h2>
          <span className="skeleton h-4 w-12 rounded-full" />
        </div>
        <div className="px-2 pt-3">
          <span className="skeleton mx-2 mb-2 block h-2 w-14" />
          <MailThreadRowsSkeleton />
        </div>
      </div>
      <div className="hidden flex-1 md:block" />
    </div>
  );
}

/** The reading pane while a conversation's messages load. */
export function MailReaderSkeleton() {
  return (
    <div aria-busy className="flex h-full min-h-0 flex-1 flex-col">
      <div className="h-14 shrink-0 border-b border-hairline" />
      <div className="mx-auto w-full max-w-4xl space-y-6 px-3 py-5 sm:px-6 lg:px-10 lg:py-8">
        <div className="space-y-2.5">
          <span className="skeleton block h-2.5 w-28" />
          <span className="skeleton block h-7 w-2/3" />
        </div>
        <div
          aria-hidden="true"
          className="surface-card space-y-5 rounded-card p-5"
        >
          <div className="flex items-center gap-3">
            <span className="skeleton size-10 rounded-full" />
            <div className="space-y-2">
              <span className="skeleton block h-3 w-40" />
              <span className="skeleton block h-2.5 w-28" />
            </div>
          </div>
          <div className="space-y-2.5">
            {ROWS.slice(0, 6).map((row) => (
              <span
                className={`skeleton block h-3 ${row === "f" ? "w-1/2" : "w-full"}`}
                key={row}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
