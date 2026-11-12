"use client";

import {
  DashCard,
  DashCardHeader,
  DashCardInsight,
} from "@/components/dashboard/DashCard";
import { formatWhole } from "@/components/dashboard/lib/format";
import {
  LiveBoxes,
  LiveContactRound,
  LiveMailPlus,
  LiveMailQuestion,
  LiveZap,
} from "@/components/icons/animated";
import { useMailContext, useMailData } from "@/features/mail/mail-context";

/** Mailboxes, domains and contacts, each a door to its own page. */
export function MailSetupCard({ className }: { className?: string }) {
  const { setView } = useMailContext();
  const { stats } = useMailData();
  const tiles = [
    {
      label: "Active mailboxes",
      value: stats.activeMailboxes,
      icon: LiveMailPlus,
      view: "mailboxes",
    },
    {
      label: "Verified domains",
      value: stats.verifiedDomains,
      icon: LiveMailQuestion,
      view: "domains",
    },
    {
      label: "Contacts",
      value: stats.contacts,
      icon: LiveContactRound,
      view: "contacts",
    },
  ] as const;
  return (
    <DashCard aria-label="Infrastructure" className={className}>
      <DashCardHeader
        description="What your mail runs on"
        icon={LiveBoxes}
        title="Infrastructure"
      />
      <div className="grid gap-2 p-5 pt-4">
        {tiles.map(({ icon: Icon, ...tile }) => (
          <button
            className="surface-inset flex items-center gap-3 rounded-tile px-3.5 py-3 text-left outline-none transition-colors hover:bg-foreground/[0.03] focus-visible:ring-2 focus-visible:ring-ring"
            data-icon-trigger
            key={tile.view}
            onClick={() => setView(tile.view)}
            type="button"
          >
            <Icon className="size-4 text-muted-foreground" strokeWidth={1.75} />
            <span className="flex-1 text-[13px] text-muted-foreground">
              {tile.label}
            </span>
            <span className="figure text-[17px] font-semibold text-foreground">
              {formatWhole(tile.value)}
            </span>
          </button>
        ))}
      </div>
      {stats.verifiedDomains === 0 ? (
        <DashCardInsight icon={LiveZap} label="Next step">
          Verify a domain so mail goes out from your own address.
        </DashCardInsight>
      ) : null}
    </DashCard>
  );
}
