"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog, responseError } from "@/components/ConfirmDialog";
import { LiveSend, LiveTrash } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";

/** Send a draft (or retry a failed one) and remove ones that never went out. */
export function BroadcastActions({
  backHref,
  broadcastId,
  name,
  status,
}: {
  backHref: string;
  broadcastId: string;
  name: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"send" | "delete" | null>(null);
  const [confirm, setConfirm] = useState<"send" | "delete" | null>(null);
  const canSend = status === "draft" || status === "failed";
  const canDelete = canSend || status === "scheduled";

  async function run(action: "send" | "delete") {
    setBusy(action);
    const response = await fetch(
      `/api/mail/broadcasts/${broadcastId}${action === "send" ? "/send" : ""}`,
      { method: action === "send" ? "POST" : "DELETE" },
    ).catch(() => null);
    setBusy(null);
    setConfirm(null);
    if (!response?.ok) {
      toast.error(
        await responseError(
          response,
          `Couldn't ${action} the broadcast. Try again.`,
        ),
      );
      return;
    }
    if (action === "delete") {
      toast.success(`${name} deleted`);
      router.push(backHref);
    } else toast.success("Sending started");
    router.refresh();
  }

  return (
    <>
      {canDelete ? (
        <Button
          data-icon-trigger
          disabled={busy !== null}
          onClick={() => setConfirm("delete")}
          size="sm"
          variant="danger"
        >
          <LiveTrash strokeWidth={1.75} />
          Delete
        </Button>
      ) : null}
      {canSend ? (
        <Button
          data-icon-trigger
          disabled={busy !== null}
          onClick={() => setConfirm("send")}
          size="sm"
          variant="hero"
        >
          <LiveSend strokeWidth={1.75} />
          {status === "failed" ? "Try again" : "Send now"}
        </Button>
      ) : null}
      <ConfirmDialog
        busy={busy !== null}
        confirmLabel={confirm === "send" ? "Send now" : "Delete"}
        description={
          confirm === "send"
            ? "It goes to everyone subscribed in its audience straight away. This can't be undone."
            : "The draft and its content are removed. This can't be undone."
        }
        onConfirm={() => confirm && void run(confirm)}
        onOpenChange={(open) => !open && setConfirm(null)}
        open={confirm !== null}
        title={confirm === "send" ? `Send ${name}?` : `Delete ${name}?`}
      />
    </>
  );
}
