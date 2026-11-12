"use client";

import { useMailContext } from "@/features/mail/mail-context";
import type { MailView } from "@/features/mail/mail-navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { view: "contacts", label: "Contacts" },
  { view: "audiences", label: "Segments" },
  { view: "properties", label: "Properties" },
] as const satisfies readonly { view: MailView; label: string }[];

export const AUDIENCE_VIEWS: readonly MailView[] = TABS.map((tab) => tab.view);

/** Contacts, segments and properties: one audience, three ways to look at it. */
export function AudienceTabs({ view }: { view: MailView }) {
  const { setView } = useMailContext();
  return (
    <nav
      aria-label="Audience"
      className="surface-inset inline-flex h-9 items-center gap-0.5 rounded-full p-0.5"
    >
      {TABS.map((tab) => (
        <button
          aria-current={tab.view === view ? "page" : undefined}
          className={cn(
            "flex h-full items-center rounded-full px-3.5 font-geist-mono text-[11px] uppercase tracking-wider outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
            tab.view === view
              ? "surface-raised text-foreground"
              : "border border-transparent text-muted-foreground hover:text-foreground",
          )}
          key={tab.view}
          onClick={() => setView(tab.view)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
