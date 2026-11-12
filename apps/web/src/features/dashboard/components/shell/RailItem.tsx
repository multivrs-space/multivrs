"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import type { AnimatedIcon } from "@/components/icons/animated";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface RailItemProps {
  label: string;
  icon: AnimatedIcon;
  narrow: boolean;
  active?: boolean;
  href?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  badge?: string;
  /** How many the section holds (domains, variables…); hidden at zero. */
  count?: number;
  /** Shown after the label in the wide rail, e.g. a shortcut or chevron. */
  trailing?: ReactNode;
}

const BASE =
  "surface-press relative flex h-9 items-center gap-3 rounded-control border text-[13px] tracking-[-0.01em] outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring";

/**
 * One rail entry. In the narrow rail it is an icon tile with a label flyout;
 * in the wide rail it is a full row. The active entry is a raised tile, so the
 * current place reads as a physical key that is pressed in.
 */
export function RailItem({
  label,
  icon: Icon,
  narrow,
  active = false,
  href,
  onClick,
  badge,
  count,
  trailing,
}: RailItemProps) {
  const className = cn(
    BASE,
    narrow ? "mx-auto w-10 justify-center" : "w-full px-2.5",
    active
      ? "surface-raised font-medium text-foreground"
      : "border-transparent text-muted-foreground hover:bg-foreground/4 hover:text-foreground",
  );
  const content = (
    <>
      <Icon
        className={cn("size-[18px]", active ? "text-primary" : "opacity-80")}
        strokeWidth={1.75}
      />
      {narrow ? null : (
        <>
          <span className="min-w-0 flex-1 truncate">{label}</span>
          {count ? (
            <span className="shrink-0 rounded-full bg-foreground/[0.07] px-1.5 py-px font-geist-mono text-[10px] text-muted-foreground">
              {count}
            </span>
          ) : null}
          {badge ? (
            <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-1.5 py-px text-[9.5px] font-medium text-primary">
              {badge}
            </span>
          ) : null}
          {trailing}
        </>
      )}
    </>
  );

  const element = href ? (
    <Link
      aria-current={active ? "page" : undefined}
      aria-label={narrow ? label : undefined}
      className={className}
      data-icon-trigger
      href={href}
      onClick={onClick}
    >
      {content}
    </Link>
  ) : (
    <button
      aria-label={narrow ? label : undefined}
      className={className}
      data-icon-trigger
      onClick={onClick}
      type="button"
    >
      {content}
    </button>
  );

  if (!narrow) return element;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{element}</TooltipTrigger>
      <TooltipContent side="right">
        {label}
        {badge ? (
          <span className="ml-2 text-[10px] text-muted-foreground">
            {badge}
          </span>
        ) : null}
      </TooltipContent>
    </Tooltip>
  );
}
