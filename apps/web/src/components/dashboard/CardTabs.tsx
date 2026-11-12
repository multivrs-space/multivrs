"use client";

import { type ReactNode, useId, useState } from "react";
import { cn } from "@/lib/utils";

export interface CardTab {
  id: string;
  label: string;
  /** Rendered on the server and handed in; this component only switches. */
  content: ReactNode;
}

interface CardTabsProps {
  tabs: CardTab[];
  className?: string;
  "aria-label": string;
}

/**
 * In-card tabs with a raised thumb. The panels arrive pre-rendered, so the
 * only client code is which one is showing.
 */
export function CardTabs({ tabs, className, ...rest }: CardTabsProps) {
  const id = useId();
  const [active, setActive] = useState(tabs[0]?.id ?? "");

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div
        className="surface-inset inline-flex h-8 w-fit items-center gap-0.5 self-start rounded-full p-0.5"
        role="tablist"
        {...rest}
      >
        {tabs.map((tab) => {
          const selected = tab.id === active;
          return (
            <button
              aria-controls={`${id}-${tab.id}`}
              aria-selected={selected}
              className={cn(
                "flex h-full items-center rounded-full px-3 text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "surface-raised font-medium text-foreground"
                  : "border border-transparent text-muted-foreground hover:text-foreground",
              )}
              id={`${id}-${tab.id}-tab`}
              key={tab.id}
              onClick={() => setActive(tab.id)}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <div
          aria-labelledby={`${id}-${tab.id}-tab`}
          className="mt-4 min-h-0 flex-1 duration-300 animate-in fade-in-0"
          hidden={tab.id !== active}
          id={`${id}-${tab.id}`}
          key={tab.id}
          role="tabpanel"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
