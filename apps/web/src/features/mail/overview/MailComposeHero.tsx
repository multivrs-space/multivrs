"use client";

import { DashCard } from "@/components/dashboard/DashCard";
import { LiveMail, LivePlus } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { useMailContext } from "@/features/mail/mail-context";

/** The page's one purple card: start a message without hunting for the button. */
export function MailComposeHero({ className }: { className?: string }) {
  const { openCompose } = useMailContext();
  return (
    <DashCard aria-label="Compose" className={className} tone="hero">
      <div className="flex h-full flex-col p-5" data-icon-trigger>
        <span className="grid size-10 place-items-center rounded-tile bg-primary-foreground/15 ring-1 ring-primary-foreground/25 ring-inset">
          <LiveMail className="size-5" strokeWidth={1.75} />
        </span>
        <h2 className="mt-5 text-[19px] font-semibold leading-tight tracking-[-0.02em]">
          Write from your own domain
        </h2>
        <p className="mt-1.5 text-[13px] leading-relaxed opacity-80">
          Replies thread with the original, and delivery states come from the
          provider, not the outbox.
        </p>
        <Button
          className="mt-5 self-start bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          data-icon-trigger
          onClick={openCompose}
          size="sm"
        >
          <LivePlus strokeWidth={2} />
          Compose
        </Button>
      </div>
    </DashCard>
  );
}
