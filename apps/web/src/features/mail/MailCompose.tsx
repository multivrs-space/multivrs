"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { LiveSend } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { MailSheet } from "@/features/mail/compose/MailSheet";
import { SendLater } from "@/features/mail/compose/SendLater";
import { MailComposeFields } from "@/features/mail/MailComposeFields";
import type {
  MailboxSummary,
  MailMessageDetail,
} from "@/features/mail/mail.types";
import { submitMailCompose } from "@/features/mail/mail-compose.client";
import { useMailContext } from "@/features/mail/mail-context";

interface MailComposeProps {
  mailboxes: MailboxSummary[];
  forward?: MailMessageDetail;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  reply?: MailMessageDetail;
}

/** A side sheet (a bottom sheet on phones) for new mail, replies and forwards. */
export function MailCompose({
  mailboxes,
  forward,
  onOpenChange,
  open,
  reply,
}: MailComposeProps) {
  const router = useRouter();
  const { notifyMailChanged } = useMailContext();
  const [sending, setSending] = useState(false);
  const [scheduled, setScheduled] = useState(false);

  function submit(formData: FormData) {
    setSending(true);
    void submitMailCompose(formData, reply).then((result) => {
      setSending(false);
      if (!result.ok) return void toast.error(result.message);
      toast.success(
        formData.get("scheduledAt") ? "Email scheduled" : "Email queued",
      );
      onOpenChange(false);
      router.refresh();
      notifyMailChanged();
    });
  }

  return (
    <MailSheet
      description="Rich text, inline images, links and attachments."
      icon={LiveSend}
      onOpenChange={onOpenChange}
      open={open}
      title={reply ? "Reply" : forward ? "Forward" : "New message"}
    >
      <form action={submit} className="flex min-h-0 flex-1 flex-col">
        <MailComposeFields
          forward={forward}
          mailboxes={mailboxes}
          reply={reply}
        />
        <div className="flex flex-wrap items-center gap-2 border-t border-hairline px-4 py-3">
          <Button
            data-icon-trigger
            disabled={sending || !mailboxes.length}
            size="sm"
            type="submit"
            variant="hero"
          >
            <LiveSend strokeWidth={1.75} />
            {sending ? "Queuing…" : scheduled ? "Schedule" : "Send"}
          </Button>
          <SendLater onChange={setScheduled} />
        </div>
      </form>
    </MailSheet>
  );
}
