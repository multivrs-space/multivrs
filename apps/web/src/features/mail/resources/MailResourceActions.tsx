"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { DASH_MENU, DASH_MENU_ITEM } from "@/components/dashboard/menu";
import {
  LiveCopy,
  LiveEllipsis,
  LiveRefresh,
  LiveSettings,
  LiveTrash,
} from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MailboxEditDialog } from "@/features/mail/MailboxEditDialog";
import type { MailResourceItem } from "@/features/mail/mail.types";
import { MailResourceDelete } from "@/features/mail/resources/MailResourceDelete";
import {
  type MailResourceView,
  mailResourceView,
} from "@/features/mail/resources/mail-resource-views";
import { cn } from "@/lib/utils";

/** The ⋯ menu on a mail resource, and the dialogs it opens. */
export function MailResourceActions({
  item,
  view,
}: {
  item: MailResourceItem;
  view: MailResourceView;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [editing, setEditing] = useState(false);
  const config = mailResourceView(view);
  const revoke = view === "credentials";
  const canVerify = view === "domains" && item.status !== "verified";
  if (!config.deletable && view !== "mailboxes") return null;

  async function verify() {
    const response = await fetch(`/api/mail/domains/${item.id}/verify`, {
      method: "POST",
    }).catch(() => null);
    if (!response?.ok) return void toast.error("DNS verification failed");
    toast.success("DNS checked");
    router.refresh();
  }

  // Dialogs sit beside the trigger so their clicks never reach a clickable row.
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: stops menu clicks from opening the row underneath.
    // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard events on the menu don't bubble to the row's click.
    <div className="contents" onClick={(event) => event.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={`Actions for ${item.name}`}
            className="size-8"
            data-icon-trigger
            size="icon-sm"
            variant="quiet"
          >
            <LiveEllipsis strokeWidth={2} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={cn(DASH_MENU, "w-48")}>
          {view === "mailboxes" ? (
            <>
              <DropdownMenuItem
                className={DASH_MENU_ITEM}
                onClick={() =>
                  void navigator.clipboard
                    .writeText(item.id)
                    .then(() => toast.success("Mailbox ID copied"))
                }
              >
                <LiveCopy className="size-3.5" />
                Copy mailbox ID
              </DropdownMenuItem>
              <DropdownMenuItem
                className={DASH_MENU_ITEM}
                onClick={() => setEditing(true)}
              >
                <LiveSettings className="size-3.5" />
                Edit
              </DropdownMenuItem>
            </>
          ) : null}
          {canVerify ? (
            <DropdownMenuItem
              className={DASH_MENU_ITEM}
              onClick={() => void verify()}
            >
              <LiveRefresh className="size-3.5" />
              Check DNS now
            </DropdownMenuItem>
          ) : null}
          {config.deletable ? (
            <DropdownMenuItem
              className={cn(
                DASH_MENU_ITEM,
                "text-rose-600 focus:bg-rose-500/10 focus:text-rose-600 dark:text-rose-400 dark:focus:text-rose-400",
              )}
              onClick={() => setConfirming(true)}
            >
              <LiveTrash className="size-3.5" />
              {revoke ? "Revoke" : "Delete"}
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      {view === "mailboxes" ? (
        <MailboxEditDialog
          mailbox={{
            id: item.id,
            name: item.name,
            address: item.address ?? item.detail,
            kind: item.kind ?? "shared",
          }}
          onOpenChange={setEditing}
          open={editing}
        />
      ) : null}
      <MailResourceDelete
        item={item}
        onOpenChange={setConfirming}
        open={confirming}
        view={view}
      />
    </div>
  );
}
