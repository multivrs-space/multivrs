"use client";

import type { MouseEvent } from "react";
import { LiveChevronRight } from "@/components/icons/animated";
import { RailItem } from "@/features/dashboard/components/shell/RailItem";
import {
  buildNavHref,
  DASHBOARD_NAV_GROUPS,
  DASHBOARD_NAV_ITEMS,
  type DashboardNavItem,
  railSlugFor,
} from "@/features/dashboard/constants/navigation";
import { canonicalSectionSlug } from "@/features/dashboard/constants/sections";
import { useDashboardScope } from "@/features/dashboard/lib/useDashboardScope";

/** Sections that open their own sub-navigation in the context panel. */
export const OPENS_PANEL = new Set(["emails", "observability"]);

interface RailNavProps {
  narrow: boolean;
  /** Called on every item click, e.g. to close the mobile sheet. */
  onNavigate?: (slug: string, event: MouseEvent<HTMLElement>) => void;
}

/** One nav entry, shared by the rail body, the rail foot and the mobile sheet. */
export function RailNavLink({
  count,
  item,
  narrow,
  onNavigate,
}: RailNavProps & { item: DashboardNavItem; count?: number }) {
  const { username, scope, activeSlug } = useDashboardScope();
  const active = railSlugFor(canonicalSectionSlug(activeSlug)) === item.slug;
  return (
    <RailItem
      active={active}
      badge={item.badge}
      count={count}
      href={buildNavHref(username, scope, item.slug)}
      icon={item.icon}
      label={item.name}
      narrow={narrow}
      onClick={(event) => {
        if (active && !OPENS_PANEL.has(item.slug)) event.preventDefault();
        onNavigate?.(item.slug, event);
      }}
      trailing={
        OPENS_PANEL.has(item.slug) ? (
          <LiveChevronRight
            className="size-3.5 shrink-0 text-muted-foreground/50"
            strokeWidth={2}
          />
        ) : null
      }
    />
  );
}

/** Every section, grouped by layer (Build, Observe, Deliver…). */
export function RailNavGroups({ narrow, onNavigate }: RailNavProps) {
  return (
    <>
      {DASHBOARD_NAV_GROUPS.map((group) => (
        <section className="mt-3 first:mt-1" key={group.id}>
          {!group.label ? null : narrow ? (
            <div className="mx-auto mb-2 h-px w-5 bg-hairline-strong" />
          ) : (
            <p className="mb-1 px-2.5 font-geist-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground/55">
              {group.label}
            </p>
          )}
          <ul className="flex flex-col gap-0.5">
            {DASHBOARD_NAV_ITEMS.filter(
              (item) => item.group === group.id && !item.parent,
            ).map((item) => (
              <li key={item.slug}>
                <RailNavLink
                  item={item}
                  narrow={narrow}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
