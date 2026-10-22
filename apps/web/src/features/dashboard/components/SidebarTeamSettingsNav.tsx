"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const TEAM_SETTINGS_ITEMS = [
  { id: "general", label: "General" },
  { id: "billing", label: "Billing" },
  { id: "build", label: "Build and Deployment" },
  { id: "invoices", label: "Invoices" },
  { id: "members", label: "Members" },
  { id: "access", label: "Access Groups" },
  { id: "webhooks", label: "Webhooks" },
  { id: "security", label: "Security & Privacy" },
  { id: "keys", label: "Key Management" },
  { id: "activity", label: "Activity" },
];

export function SidebarTeamSettingsNav() {
  const [activeItem, setActiveItem] = useState("general");

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
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 hide-scrollbar">
        <ul className="flex flex-col gap-0.5">
          {TEAM_SETTINGS_ITEMS.map((item) => {
            const isActive = activeItem === item.id;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={() => setActiveItem(item.id)}
                  className={cn(
                    "flex h-8 items-center rounded-md px-2.5 text-xs transition-colors",
                    isActive
                      ? "bg-white/[0.08] dark:bg-white/[0.08] font-medium text-foreground"
                      : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground",
                  )}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
