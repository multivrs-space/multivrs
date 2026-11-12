import { Lock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface SegmentedNavItem {
  label: string;
  href: string;
  active: boolean;
  /** Shown with a lock and not navigable, e.g. a plan-gated range. */
  locked?: boolean;
}

interface SegmentedNavProps {
  items: SegmentedNavItem[];
  "aria-label": string;
  className?: string;
}

/**
 * A recessed track with a raised thumb on the active segment, rendered as
 * links so it works in Server Components and keeps state in the URL.
 */
export function SegmentedNav({ items, className, ...rest }: SegmentedNavProps) {
  return (
    <nav
      className={cn(
        "surface-inset inline-flex h-9 items-center gap-0.5 rounded-full p-0.5",
        className,
      )}
      {...rest}
    >
      {items.map((item) =>
        item.locked ? (
          <span
            aria-disabled="true"
            className="flex h-full items-center gap-1 rounded-full px-3 font-geist-mono text-[11px] uppercase tracking-wider text-muted-foreground/50"
            key={item.label}
            title="Available with Web Analytics Plus"
          >
            <Lock aria-hidden="true" className="size-3" />
            {item.label}
          </span>
        ) : (
          <Link
            aria-current={item.active ? "page" : undefined}
            className={cn(
              "flex h-full items-center rounded-full px-3.5 font-geist-mono text-[11px] uppercase tracking-wider outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
              item.active
                ? "surface-raised text-foreground"
                : "border border-transparent text-muted-foreground hover:text-foreground",
            )}
            href={item.href}
            key={item.label}
            scroll={false}
          >
            {item.label}
          </Link>
        ),
      )}
    </nav>
  );
}
