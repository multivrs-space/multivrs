"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { responseError } from "@/components/ConfirmDialog";
import { CopyButton } from "@/components/CopyButton";
import { DashDialogHeader } from "@/components/dashboard/DashDialogHeader";
import { DASH_DIALOG, DASH_FIELD } from "@/components/dashboard/menu";
import { LiveMailPlus } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MAIL_SELECT } from "@/features/mail/MailFormControls";

const KINDS = [
  { value: "shared", label: "Shared: everyone on the team" },
  { value: "personal", label: "Personal: only you" },
  { value: "sending", label: "Sending: everyone on the team" },
  { value: "no-reply", label: "No-reply: everyone on the team" },
] as const;

/** Renames a mailbox or changes who sees it. The address can't change. */
export function MailboxEditDialog({
  mailbox,
  open,
  onOpenChange,
}: {
  mailbox: { id: string; name: string; address: string; kind: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function save(form: FormData) {
    setSaving(true);
    const response = await fetch(`/api/mail/mailboxes/${mailbox.id}`, {
      body: JSON.stringify({
        name: String(form.get("name") ?? "").trim(),
        kind: String(form.get("kind") ?? mailbox.kind),
      }),
      headers: { "content-type": "application/json" },
      method: "PATCH",
    }).catch(() => null);
    setSaving(false);
    if (!response?.ok) {
      toast.error(await responseError(response, "Couldn't save the mailbox."));
      return;
    }
    toast.success("Mailbox saved");
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={DASH_DIALOG}>
        <DashDialogHeader
          description={mailbox.address}
          icon={LiveMailPlus}
          title="Edit mailbox"
        />
        <form action={(form) => void save(form)} className="space-y-4">
          <div className="space-y-1.5">
            <Label
              className="text-[12px] text-muted-foreground"
              htmlFor="mailbox-id"
            >
              Mailbox ID
            </Label>
            <div className="flex items-center gap-1">
              <Input
                className={`${DASH_FIELD} select-all font-geist-mono text-[12px] text-muted-foreground`}
                id="mailbox-id"
                readOnly
                value={mailbox.id}
              />
              <CopyButton className="size-9" text={mailbox.id} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label
              className="text-[12px] text-muted-foreground"
              htmlFor="mailbox-name"
            >
              Name
            </Label>
            <Input
              className={DASH_FIELD}
              defaultValue={mailbox.name}
              id="mailbox-name"
              name="name"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label
              className="text-[12px] text-muted-foreground"
              htmlFor="mailbox-kind"
            >
              Who sees it
            </Label>
            <select
              className={MAIL_SELECT}
              defaultValue={mailbox.kind}
              id="mailbox-kind"
              name="kind"
            >
              {KINDS.map((kind) => (
                <option key={kind.value} value={kind.value}>
                  {kind.label}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button disabled={saving} size="sm" type="submit" variant="hero">
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
