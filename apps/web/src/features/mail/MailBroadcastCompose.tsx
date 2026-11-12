"use client";

import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { LiveMails } from "@/components/icons/animated";
import { BroadcastComposeActions } from "@/features/mail/compose/BroadcastComposeActions";
import { BroadcastRecipients } from "@/features/mail/compose/BroadcastRecipients";
import {
  ENVELOPE_FIELD,
  EnvelopeLine,
} from "@/features/mail/compose/EnvelopeLine";
import { MailSheet } from "@/features/mail/compose/MailSheet";
import { MergeTags } from "@/features/mail/compose/MergeTags";
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
  const params = useParams<{ username?: string; scope?: string }>();
  const { mailboxes } = useMailData();
  const audiences = resources.audiences;
  const [sending, setSending] = useState(false);
  const [scheduled, setScheduled] = useState(false);
  const body = useRef<HTMLTextAreaElement>(null);

  function submit(formData: FormData) {
    const draft = formData.get("intent") === "draft";
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
        draft
          ? "Draft saved"
          : formData.get("scheduledAt")
            ? "Broadcast scheduled"
            : "Sending started",
      );
      onOpenChange(false);
      // Its own page shows it going out, copy by copy.
      if (result.id && params.username && params.scope)
        router.push(
          `/${params.username}/${params.scope}/email/broadcasts/${result.id}`,
        );
      else router.refresh();
    });
  }

  return (
    <MailSheet
      description="Send to everyone subscribed, or one segment."
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
            <BroadcastRecipients
              audiences={audiences}
              mailboxes={mailboxes}
              subscribed={resources.audience.subscribed}
            />
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
          <div className="space-y-3 p-4 sm:p-5">
            <MergeTags
              properties={resources.audience.properties.map(
                (property) => property.key,
              )}
              target={body}
            />
            <textarea
              aria-label="Campaign body"
              className="surface-inset min-h-[260px] w-full resize-y rounded-tile p-4 text-[14px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring/40"
              name="body"
              placeholder={"Hi {{first_name|there}},\n\nWrite the campaign…"}
              ref={body}
              required
            />
          </div>
        </div>
        <BroadcastComposeActions
          onScheduledChange={setScheduled}
          scheduled={scheduled}
          sending={sending}
        />
      </form>
    </MailSheet>
  );
}
