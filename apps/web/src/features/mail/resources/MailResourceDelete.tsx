"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog, responseError } from "@/components/ConfirmDialog";
import type { MailResourceItem } from "@/features/mail/mail.types";
import {
  type MailResourceView,
  mailResourceView,
} from "@/features/mail/resources/mail-resource-views";

const DELETE_COPY: Partial<Record<MailResourceView, string>> = {
  domains:
    "This removes it from Multivrs. Add it again later to get new DKIM records, then replace the old ones at your DNS provider.",
  credentials:
    "Apps using this API key or SMTP password stop authenticating straight away.",
};

/** Confirms, then deletes (or for credentials, revokes) one mail resource. */
export function MailResourceDelete({
  item,
  view,
  open,
  onOpenChange,
}: {
  item: MailResourceItem;
  view: MailResourceView;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const noun = mailResourceView(view).title.toLowerCase().replace(/s$/, "");
  const verb = view === "credentials" ? "Revoke" : "Delete";

  async function remove() {
    setDeleting(true);
    const response = await fetch(`/api/mail/${view}/${item.id}`, {
      method: "DELETE",
    }).catch(() => null);
    setDeleting(false);
    if (!response?.ok)
      return void toast.error(
        await responseError(response, `Couldn't delete this ${noun}.`),
      );
    onOpenChange(false);
    toast.success(
      `${item.name} ${view === "credentials" ? "revoked" : "deleted"}`,
    );
    router.refresh();
  }

  return (
    <ConfirmDialog
      busy={deleting}
      confirmLabel={verb}
      description={
        DELETE_COPY[view] ?? `This permanently deletes this ${noun}.`
      }
      onConfirm={() => void remove()}
      onOpenChange={onOpenChange}
      open={open}
      title={`${verb} ${item.name}?`}
    />
  );
}
