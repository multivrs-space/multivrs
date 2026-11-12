"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { LiveInbox, LiveSend } from "@/components/icons/animated";
import { relativeTime } from "@/features/dashboard/lib/relative-time";
import type { MailResourceItem } from "@/features/mail/mail.types";
import { MailResourceActions } from "@/features/mail/resources/MailResourceActions";
import { MailResourceStatus } from "@/features/mail/resources/MailResourceStatus";
import {
  type MailResourceView,
  mailResourceView,
} from "@/features/mail/resources/mail-resource-views";
import { SenderAvatar } from "@/features/mail/SenderAvatar";
import { cn } from "@/lib/utils";

/** One line of a long mail list: what it is, its state, when, and actions. */
export function MailResourceRow({
  item,
  view,
}: {
  item: MailResourceItem;
  view: MailResourceView;
}) {
  const router = useRouter();
  const params = useParams<{ username?: string; scope?: string }>();
  const config = mailResourceView(view);
  const href =
    view === "domains" && params.username && params.scope
      ? `/${params.username}/${params.scope}/email/domains/${item.id}`
      : null;
  const Icon =
    view === "logs"
      ? item.detail.startsWith("inbound")
        ? LiveInbox
        : LiveSend
      : config.icon;
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: the row opens its detail page; the name link is the keyboard path.
    // biome-ignore lint/a11y/useKeyWithClickEvents: the name link handles keyboard users.
    <div
      className={cn(
        "group flex min-w-0 items-center gap-3 rounded-tile px-3 py-2.5 transition-colors",
        href && "cursor-pointer hover:bg-foreground/[0.03]",
      )}
      data-icon-trigger
      onClick={href ? () => router.push(href) : undefined}
    >
      {view === "contacts" ? (
        <SenderAvatar
          address={item.name}
          className="shrink-0"
          name={item.detail === "Contact" ? undefined : item.detail}
          size="md"
        />
      ) : (
        <span className="surface-inset grid size-8 shrink-0 place-items-center rounded-[9px] text-muted-foreground">
          <Icon className="size-4" strokeWidth={1.75} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        {href ? (
          <Link
            className={cn(
              "block truncate text-[13.5px] font-medium text-foreground outline-none focus-visible:underline",
              config.mono && "font-geist-mono text-[13px]",
            )}
            href={href}
            onClick={(event) => event.stopPropagation()}
          >
            {item.name}
          </Link>
        ) : (
          <p
            className={cn(
              "truncate text-[13.5px] font-medium text-foreground",
              config.mono && "font-geist-mono text-[13px]",
            )}
          >
            {item.name || "(no subject)"}
          </p>
        )}
        <p
          className={cn(
            "mt-0.5 truncate text-[12px] text-muted-foreground",
            view === "credentials" && "font-geist-mono",
          )}
        >
          {item.detail}
        </p>
      </div>
      <MailResourceStatus kind={config.status} status={item.status} />
      {item.createdAt ? (
        <time
          className="hidden w-24 shrink-0 text-right text-[11.5px] text-muted-foreground sm:block"
          dateTime={item.createdAt}
          title={new Date(item.createdAt).toUTCString()}
        >
          {relativeTime(item.createdAt)}
        </time>
      ) : null}
      <MailResourceActions item={item} view={view} />
    </div>
  );
}
