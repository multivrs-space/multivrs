"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import {
  type AnimatedIcon,
  LiveCreditCard,
  LiveHistory,
  LiveLayoutGrid,
  LiveLifeBuoy,
  LiveLock,
  LiveMail,
  LiveReceipt,
  LiveSearch,
  LiveSettings,
  LiveUserRound,
} from "@/components/icons/animated";
import {
  ContextNavGroup,
  ContextNavHeader,
  ContextNavItem,
  ContextNavList,
} from "@/features/dashboard/components/shell/ContextNav";

interface AccountNavItem {
  label: string;
  tab: string;
  href: string;
  icon: AnimatedIcon;
}

const tab = (
  label: string,
  id: string,
  icon: AnimatedIcon,
): AccountNavItem => ({
  label,
  tab: id,
  href: id === "settings" ? "/account/settings" : `/account/settings?tab=${id}`,
  icon,
});

const SECTIONS: { label?: string; items: AccountNavItem[] }[] = [
  {
    items: [
      tab("Overview", "overview", LiveLayoutGrid),
      tab("Activity", "activity", LiveHistory),
      tab("Invites", "invites", LiveMail),
      { label: "Support", tab: "support", href: "/help", icon: LiveLifeBuoy },
    ],
  },
  {
    label: "Settings",
    items: [
      tab("General", "settings", LiveSettings),
      tab("Authentication", "authentication", LiveLock),
      tab("Sign in with Multivrs", "sign-in-with-multivrs", LiveUserRound),
      tab("Billing information", "billing-information", LiveCreditCard),
      tab("Billing items", "billing-items", LiveReceipt),
      tab("Invoices", "invoices", LiveReceipt),
    ],
  },
];

function SidebarAccountNavContent({
  onLinkClick,
}: {
  onLinkClick?: () => void;
}) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "settings";
  const [search, setSearch] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const query = search.trim().toLowerCase();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      const typing =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if (
        event.key.toLowerCase() === "f" &&
        !typing &&
        !event.metaKey &&
        !event.ctrlKey
      ) {
        event.preventDefault();
        input.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ContextNavHeader icon={LiveUserRound} title="Account">
        <label className="surface-inset flex h-8 items-center gap-2 rounded-control px-2.5 text-muted-foreground focus-within:ring-2 focus-within:ring-ring">
          <LiveSearch className="size-3.5 shrink-0" strokeWidth={2} />
          <input
            aria-label="Find a setting"
            className="min-w-0 flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/60"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Find"
            ref={input}
            type="search"
            value={search}
          />
          <kbd className="surface-raised rounded-[5px] px-1.5 font-geist-mono text-[10px] leading-4">
            F
          </kbd>
        </label>
      </ContextNavHeader>
      <ContextNavList>
        {SECTIONS.map((section) => {
          const items = section.items.filter((item) =>
            item.label.toLowerCase().includes(query),
          );
          if (!items.length) return null;
          return [
            section.label ? (
              <ContextNavGroup key={section.label} label={section.label} />
            ) : null,
            ...items.map((item) => (
              <ContextNavItem
                active={currentTab === item.tab}
                href={item.href}
                icon={item.icon}
                key={item.tab}
                label={item.label}
                onClick={() => onLinkClick?.()}
              />
            )),
          ];
        })}
      </ContextNavList>
    </div>
  );
}

export function SidebarAccountNav({
  onLinkClick,
}: {
  onLinkClick?: () => void;
} = {}) {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <SidebarAccountNavContent onLinkClick={onLinkClick} />
    </Suspense>
  );
}
