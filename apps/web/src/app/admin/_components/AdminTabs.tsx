"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
] as const;

/**
 * Active state comes from the client-side pathname, since a server layout
 * cannot read the current route. Exact match on the tab href so /admin does
 * not also light up for /admin/users (and vice versa).
 */
export function AdminTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 rounded-card border border-hairline p-1">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={`rounded-[9px] px-3 py-1.5 text-[13px] font-medium transition-colors ${
              active
                ? "bg-foreground/5 text-foreground"
                : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
            }`}
            href={tab.href}
            key={tab.href}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
