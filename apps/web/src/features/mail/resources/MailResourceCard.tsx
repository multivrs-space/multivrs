"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { DashCard } from "@/components/dashboard/DashCard";
import { fullTimestamp } from "@/features/dashboard/lib/relative-time";
import type { MailResourceItem } from "@/features/mail/mail.types";
import { MailResourceActions } from "@/features/mail/resources/MailResourceActions";
import { MailResourceStatus } from "@/features/mail/resources/MailResourceStatus";
import {
  type MailResourceView,
  mailResourceView,
} from "@/features/mail/resources/mail-resource-views";
import { SenderAvatar } from "@/features/mail/SenderAvatar";

/** A tile for things you open and shape: campaigns, templates, mailboxes. */
export function MailResourceCard({
  item,
  view,
}: {
  item: MailResourceItem;
  view: MailResourceView;
}) {
  const config = mailResourceView(view);
  const Icon = config.icon;
  const params = useParams<{ username?: string; scope?: string }>();
  // Broadcasts open their own page: content, status and results.
  const href =
    view === "broadcasts" && params.username && params.scope
      ? `/${params.username}/${params.scope}/email/broadcasts/${item.id}`
      : undefined;
  return (
    <DashCard
      aria-label={item.name}
      className="relative min-h-[164px] p-4 transition-colors has-[a[data-card-link]:hover]:bg-foreground/[0.02]"
    >
      {href ? (
        <Link
          aria-label={`Open ${item.name}`}
          className="absolute inset-0 z-0 rounded-[inherit] outline-none focus-visible:ring-2 focus-visible:ring-ring"
          data-card-link
          href={href}
        />
      ) : null}
      <div className="flex items-start justify-between gap-3">
        {view === "mailboxes" ? (
          <SenderAvatar
            address={item.address ?? item.detail}
            name={item.name}
            size="lg"
          />
        ) : (
          <span
            className="surface-inset grid size-10 place-items-center rounded-tile text-muted-foreground"
            data-card-icon
          >
            <Icon className="size-[18px]" strokeWidth={1.75} />
          </span>
        )}
        <div className="relative z-10">
          <MailResourceActions item={item} view={view} />
        </div>
      </div>
      <p className="mt-4 truncate text-[14.5px] font-semibold tracking-[-0.01em] text-foreground">
        {item.name}
      </p>
      <p
        className={
          view === "mailboxes"
            ? "mt-0.5 truncate font-geist-mono text-[12px] text-muted-foreground"
            : "mt-0.5 line-clamp-2 text-[12.5px] text-muted-foreground"
        }
      >
        {view === "mailboxes" ? (item.address ?? item.detail) : item.detail}
      </p>
      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <MailResourceStatus kind={config.status} status={item.status} />
        {view === "mailboxes" && item.kind ? (
          <span className="text-[11.5px] capitalize text-muted-foreground">
            {item.kind}
          </span>
        ) : item.createdAt ? (
          <time
            className="text-[11.5px] text-muted-foreground"
            dateTime={item.createdAt}
            title={fullTimestamp(item.createdAt)}
          >
            {new Date(item.createdAt).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
              timeZone: "UTC",
            })}
          </time>
        ) : null}
      </div>
    </DashCard>
  );
}
