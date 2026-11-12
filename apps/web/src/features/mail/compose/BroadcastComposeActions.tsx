"use client";

import { LiveSend } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { SendLater } from "@/features/mail/compose/SendLater";

/** Send now or at a set time, or keep it as a draft to finish later. */
export function BroadcastComposeActions({
  onScheduledChange,
  scheduled,
  sending,
}: {
  onScheduledChange: (scheduled: boolean) => void;
  scheduled: boolean;
  sending: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-hairline px-4 py-3">
      <Button
        data-icon-trigger
        disabled={sending}
        name="intent"
        size="sm"
        type="submit"
        value="send"
        variant="hero"
      >
        <LiveSend strokeWidth={1.75} />
        {sending
          ? "Saving…"
          : scheduled
            ? "Schedule campaign"
            : "Send campaign"}
      </Button>
      <SendLater onChange={onScheduledChange} />
      <Button
        className="ml-auto"
        disabled={sending}
        name="intent"
        size="sm"
        type="submit"
        value="draft"
        variant="quiet"
      >
        Save draft
      </Button>
    </div>
  );
}
