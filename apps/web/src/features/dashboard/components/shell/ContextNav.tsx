"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import { type AnimatedIcon, LiveArrowLeft } from "@/components/icons/animated";
import { cn } from "@/lib/utils";

/**
 * Building blocks for the context panel (Mail, Observability, Team settings,
 * Account): a header that leads back out, group labels, and rows that match
 * the rail's raised-key active state.
 */

interface ContextNavHeaderProps {
  title: string;
  icon?: AnimatedIcon;
  /** Where "back" goes; omit to show the title only. */
  backHref?: string;
  onBack?: () => void;
  /** Below the title, e.g. the Compose button. */
  children?: ReactNode;
}

export function ContextNavHeader({
  title,
  icon: Icon,
  backHref,
  onBack,
  children,
}: ContextNavHeaderProps) {
  const back = (
    <>
      <LiveArrowLeft className="size-3.5" strokeWidth={2} />
      <span>Back</span>
    </>
  );
  const backClass =
    "flex h-7 items-center gap-1.5 rounded-full px-2 text-[11px] font-medium text-muted-foreground outline-none transition-colors hover:bg-foreground/4 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="space-y-3 px-3 pb-3">
      {onBack ? (
        <button
          className={backClass}
          data-icon-trigger
          onClick={onBack}
          type="button"
        >
          {back}
        </button>
      ) : backHref ? (
        <Link className={backClass} data-icon-trigger href={backHref}>
          {back}
        </Link>
      ) : null}
      <div className="flex items-center gap-2.5 px-1" data-icon-trigger>
        {Icon ? (
          <span className="surface-raised grid size-8 place-items-center rounded-[9px] text-primary">
            <Icon className="size-4" strokeWidth={1.75} />
          </span>
        ) : null}
        <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-foreground">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

export function ContextNavGroup({ label }: { label: string }) {
  return (
    <li>
      <p className="mb-1 mt-4 px-2.5 font-geist-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground/55">
        {label}
      </p>
    </li>
  );
}

interface ContextNavItemProps {
  label: string;
  icon?: AnimatedIcon;
  active: boolean;
  href: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  /** Right side, e.g. a folder count. */
  trailing?: ReactNode;
  /** Plain anchor for in-page `#section` links. */
  native?: boolean;
  /** Child rows sit under their parent without an icon. */
  inset?: boolean;
}

export function ContextNavItem({
  label,
  icon: Icon,
  active,
  href,
  onClick,
  trailing,
  native = false,
  inset = false,
}: ContextNavItemProps) {
  const className = cn(
    "surface-press flex h-8.5 items-center gap-2.5 rounded-control border px-2.5 text-[13px] tracking-[-0.01em] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
    inset && "pl-9",
    active
      ? "surface-raised font-medium text-foreground"
      : "border-transparent text-muted-foreground hover:bg-foreground/4 hover:text-foreground",
  );
  const content = (
    <>
      {Icon ? (
        <Icon
          className={cn("size-4", active ? "text-primary" : "opacity-80")}
          strokeWidth={1.75}
        />
      ) : null}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {trailing}
    </>
  );

  return (
    <li>
      {native ? (
        <a
          aria-current={active ? "location" : undefined}
          className={className}
          data-icon-trigger
          href={href}
          onClick={onClick}
        >
          {content}
        </a>
      ) : (
        <Link
          aria-current={active ? "page" : undefined}
          className={className}
          data-icon-trigger
          href={href}
          onClick={onClick}
        >
          {content}
        </Link>
      )}
    </li>
  );
}

/** The scrolling list body shared by every context nav. */
export function ContextNavList({ children }: { children: ReactNode }) {
  return (
    <nav className="hide-scrollbar flex-1 overflow-y-auto overflow-x-hidden px-3 pb-4">
      <ul className="flex flex-col gap-0.5">{children}</ul>
    </nav>
  );
}
