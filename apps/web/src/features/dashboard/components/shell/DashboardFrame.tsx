"use client";

import { type ReactNode, useEffect, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RailContext } from "@/features/dashboard/components/shell/rail-context";
import {
  RAIL_COOKIE,
  RAIL_COOKIE_MAX_AGE,
} from "@/features/dashboard/constants/shell";
import { useContextNav } from "@/features/dashboard/lib/useContextNav";

interface DashboardFrameProps {
  /** Read from the rail cookie on the server so the first paint is right. */
  initialCollapsed: boolean;
  children: ReactNode;
}

/**
 * Root of the rail shell. Publishes the rail and context-panel widths as CSS
 * variables (see `.dashboard-frame` in dashboard-surfaces.css) so the rail,
 * the context panel and the canvas lay themselves out without JS measuring.
 */
export function DashboardFrame({
  initialCollapsed,
  children,
}: DashboardFrameProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const contextNav = useContextNav();

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    // biome-ignore lint/suspicious/noDocumentCookie: a plain preference cookie read back during SSR
    document.cookie = `${RAIL_COOKIE}=${next ? "collapsed" : "expanded"}; path=/; max-age=${RAIL_COOKIE_MAX_AGE}; samesite=lax`;
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "[" || event.metaKey || event.ctrlKey) return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      ) {
        return;
      }
      toggle();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  return (
    <RailContext
      value={{ collapsed, narrow: collapsed || contextNav !== null, toggle }}
    >
      <TooltipProvider>
        <div
          className="dashboard-surface dashboard-frame min-h-dvh bg-ink text-foreground lg:bg-ink-raised dark:lg:bg-ink"
          data-context={contextNav ? "true" : undefined}
          data-rail={collapsed ? "collapsed" : "expanded"}
          data-shell="rail"
        >
          {children}
        </div>
      </TooltipProvider>
    </RailContext>
  );
}
