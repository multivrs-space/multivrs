"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { LiveMails, LiveSend } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { BroadcastRecipients } from "@/features/mail/compose/BroadcastRecipients";
import {
  ENVELOPE_FIELD,
  EnvelopeLine,
} from "@/features/mail/compose/EnvelopeLine";
import { MailSheet } from "@/features/mail/compose/MailSheet";
import { SendLater } from "@/features/mail/compose/SendLater";
import type { MailResources } from "@/features/mail/mail.types";
import { useMailData } from "@/features/mail/mail-context";
import { submitMailResource } from "@/features/mail/mail-resource.client";

interface MailBroadcastComposeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  resources: MailResources;
}

/** A campaign to an audience: who it's from, who gets it, what it says. */
export function MailBroadcastCompose({
  open,
  onOpenChange,
  projectId,
  resources,
}: MailBroadcastComposeProps) {
  const router = useRouter();
  const params = useParams<{ username?: string }>();
  const { mailboxes } = useMailData();
  const audiences = resources.audiences;
  const [sending, setSending] = useState(false);
  const [scheduled, setScheduled] = useState(false);

  function submit(formData: FormData) {
    setSending(true);
    void submitMailResource(
      "broadcasts",
      formData,
      projectId,
      params.username,
    ).then((result) => {
      setSending(false);
      if (!result.ok) return void toast.error(result.message);
      toast.success(
        formData.get("scheduledAt")
          ? "Broadcast scheduled"
          : "Broadcast queued",
      );
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <MailSheet
      description="Draft, schedule and send to an audience that opted in."
      icon={LiveMails}
      onOpenChange={onOpenChange}
      open={open}
      title="New broadcast"
    >
      <form action={submit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="divide-y divide-hairline border-b border-hairline">
            <EnvelopeLine htmlFor="broadcast-name" label="Campaign">
              <input
                className={`${ENVELOPE_FIELD} font-medium`}
                id="broadcast-name"
                name="name"
                placeholder="October product launch"
                required
              />
            </EnvelopeLine>
            <BroadcastRecipients audiences={audiences} mailboxes={mailboxes} />
            <EnvelopeLine htmlFor="broadcast-subject" label="Subject">
              <input
                className={`${ENVELOPE_FIELD} font-medium`}
                id="broadcast-subject"
                name="subject"
                placeholder="What we shipped this week"
                required
              />
            </EnvelopeLine>
          </div>
          <div className="p-4 sm:p-5">
            <textarea
              aria-label="Campaign body"
              className="surface-inset min-h-[260px] w-full resize-y rounded-tile p-4 text-[14px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring/40"
              name="body"
              placeholder="Write the campaign…"
              required
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-hairline px-4 py-3">
          <Button
            data-icon-trigger
            disabled={sending || !audiences.length}
            size="sm"
            type="submit"
            variant="hero"
          >
            <LiveSend strokeWidth={1.75} />
            {sending
              ? "Queuing…"
              : scheduled
                ? "Schedule campaign"
                : "Send campaign"}
          </Button>
          <SendLater onChange={setScheduled} />
        </div>
      </form>
    </MailSheet>
  );
}
