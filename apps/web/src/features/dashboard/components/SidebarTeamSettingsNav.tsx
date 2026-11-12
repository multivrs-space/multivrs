"use client";

import { useEffect, useState } from "react";
import {
  LiveCreditCard,
  LiveReceipt,
  LiveSettings,
  LiveUsers,
} from "@/components/icons/animated";
import {
  ContextNavHeader,
  ContextNavItem,
  ContextNavList,
} from "@/features/dashboard/components/shell/ContextNav";
import { useDashboardScope } from "@/features/dashboard/lib/useDashboardScope";

/** Only sections the team settings page actually has. */
const TEAM_SETTINGS_ITEMS = [
  { id: "general", label: "General", icon: LiveSettings },
  { id: "members", label: "Members", icon: LiveUsers },
  { id: "billing", label: "Billing", icon: LiveCreditCard },
  { id: "invoices", label: "Invoices", icon: LiveReceipt },
];

/** Team settings sections; the current one follows the scroll position. */
export function SidebarTeamSettingsNav({
  onBack,
  onLinkClick,
}: {
  onBack?: () => void;
  onLinkClick?: () => void;
} = {}) {
  const [activeItem, setActiveItem] = useState("general");
  const { username } = useDashboardScope();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveItem(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -65% 0px" },
    );

    for (const item of TEAM_SETTINGS_ITEMS) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ContextNavHeader
        backHref={username ? `/${username}` : undefined}
        icon={LiveSettings}
        onBack={onBack}
        title="Team settings"
      />
      <ContextNavList>
        {TEAM_SETTINGS_ITEMS.map((item) => (
          <ContextNavItem
            active={activeItem === item.id}
            href={`#${item.id}`}
            icon={item.icon}
            key={item.id}
            label={item.label}
            native
            onClick={() => {
              setActiveItem(item.id);
              onLinkClick?.();
            }}
          />
        ))}
      </ContextNavList>
    </div>
  );
}
