"use client";

import { type ReactNode, useState } from "react";
import { DashCard } from "@/components/dashboard/DashCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import {
  SegmentedControl,
  type SegmentOption,
} from "@/components/dashboard/SegmentedControl";
import { MailResourceRow } from "@/features/mail/MailResourceRow";
import type { MailResourceItem } from "@/features/mail/mail.types";
import { MailboxGroups } from "@/features/mail/resources/MailboxGroups";
import { MailResourceCard } from "@/features/mail/resources/MailResourceCard";
import {
  type MailResourceView,
  mailResourceView,
  statusLabel,
} from "@/features/mail/resources/mail-resource-views";

/** Filter by status, then rows or tiles, with a designed empty state. */
export function MailResourceList({
  items,
  view,
  query,
  emptyAction,
  footer,
}: {
  items: MailResourceItem[];
  view: MailResourceView;
  query: string;
  emptyAction?: ReactNode;
  footer?: ReactNode;
}) {
  const config = mailResourceView(view);
  const [status, setStatus] = useState("all");
  const counts = new Map<string, number>();
  for (const item of items)
    counts.set(item.status, (counts.get(item.status) ?? 0) + 1);
  const options: SegmentOption<string>[] = [
    { value: "all", label: "All", count: items.length },
    ...[...counts].map(([value, count]) => ({
      value,
      label: statusLabel(value),
      count,
    })),
  ];
  const needle = query.trim().toLowerCase();
  const shown = items.filter(
    (item) =>
      (status === "all" || item.status === status) &&
      (!needle ||
        `${item.name} ${item.detail} ${item.status}`
          .toLowerCase()
          .includes(needle)),
  );

  if (!items.length) {
    return (
      <DashCard>
        <EmptyState
          actions={emptyAction}
          description={config.empty}
          glyph={config.icon}
          title={`No ${config.title.toLowerCase()} yet`}
        />
      </DashCard>
    );
  }
  return (
    <div className="space-y-3">
      {counts.size > 1 ? (
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <SegmentedControl
            aria-label={`Filter ${config.title.toLowerCase()} by status`}
            onChange={setStatus}
            options={options}
            value={status}
          />
        </div>
      ) : null}
      {shown.length === 0 ? (
        <p className="surface-card rounded-card px-5 py-12 text-center text-[13px] text-muted-foreground">
          Nothing matches{needle ? ` “${query.trim()}”` : " this filter"}.
        </p>
      ) : view === "mailboxes" ? (
        <MailboxGroups items={shown} />
      ) : config.layout === "cards" ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {shown.map((item) => (
            <MailResourceCard item={item} key={item.id} view={view} />
          ))}
        </div>
      ) : (
        <DashCard aria-label={config.title}>
          <div className="divide-y divide-hairline p-2">
            {shown.map((item) => (
              <MailResourceRow item={item} key={item.id} view={view} />
            ))}
          </div>
        </DashCard>
      )}
      {footer}
    </div>
  );
}
