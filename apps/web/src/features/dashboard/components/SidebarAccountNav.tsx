"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Activity,
  FileText,
  Globe,
  HelpCircle,
  LayoutGrid,
  Mail,
  Search,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

function SidebarAccountNavContent() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "settings";
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Search Input matching Vercel Find [F] */}
      <div className="px-3 pt-3 pb-2">
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-2.5 size-3.5 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Find"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-full rounded-md border border-[var(--hairline)] bg-muted pl-8 pr-7 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-foreground/30 focus:ring-1 focus:ring-foreground/20"
          />
          <kbd className="pointer-events-none absolute right-2 select-none rounded border border-[var(--hairline)] bg-foreground/5 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            F
          </kbd>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 hide-scrollbar">
        <ul className="flex flex-col gap-0.5">
          {/* Overview */}
          <li>
            <Link
              href="/account/settings?tab=overview"
              className={cn(
                "flex h-8 items-center gap-2.5 rounded-md px-2.5 text-xs transition-colors",
                currentTab === "overview"
                  ? "bg-foreground/[0.08] font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
              )}
            >
              <LayoutGrid className="size-4 shrink-0 text-muted-foreground/70" strokeWidth={1.75} />
              <span>Overview</span>
            </Link>
          </li>

          {/* Activity */}
          <li>
            <Link
              href="/account/settings?tab=activity"
              className={cn(
                "flex h-8 items-center gap-2.5 rounded-md px-2.5 text-xs transition-colors",
                currentTab === "activity"
                  ? "bg-foreground/[0.08] font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
              )}
            >
              <Activity className="size-4 shrink-0 text-muted-foreground/70" strokeWidth={1.75} />
              <span>Activity</span>
            </Link>
          </li>

          {/* Invites */}
          <li>
            <Link
              href="/account/settings?tab=invites"
              className={cn(
                "flex h-8 items-center gap-2.5 rounded-md px-2.5 text-xs transition-colors",
                currentTab === "invites"
                  ? "bg-foreground/[0.08] font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
              )}
            >
              <Mail className="size-4 shrink-0 text-muted-foreground/70" strokeWidth={1.75} />
              <span>Invites</span>
            </Link>
          </li>

          {/* Support */}
          <li>
            <Link
              href="/help"
              className="flex h-8 items-center gap-2.5 rounded-md px-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
            >
              <HelpCircle className="size-4 shrink-0 text-muted-foreground/70" strokeWidth={1.75} />
              <span>Support</span>
            </Link>
          </li>

          {/* Divider */}
          <li className="my-1.5 h-px bg-[var(--hairline)]" aria-hidden="true" />

          {/* Settings */}
          <li>
            <Link
              href="/account/settings"
              className={cn(
                "flex h-8 items-center gap-2.5 rounded-md px-2.5 text-xs transition-colors",
                currentTab === "settings"
                  ? "bg-foreground/[0.08] font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
              )}
            >
              <Settings className="size-4 shrink-0" strokeWidth={1.75} />
              <span>Settings</span>
            </Link>
          </li>

          {/* Authentication */}
          <li>
            <Link
              href="/account/settings?tab=authentication"
              className={cn(
                "flex h-8 items-center rounded-md pl-9 pr-2.5 text-xs transition-colors",
                currentTab === "authentication"
                  ? "bg-foreground/[0.08] font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
              )}
            >
              Authentication
            </Link>
          </li>

          {/* Sign in with Multivrs */}
          <li>
            <Link
              href="/account/settings?tab=sign-in-with-multivrs"
              className={cn(
                "flex h-8 items-center rounded-md pl-9 pr-2.5 text-xs transition-colors",
                currentTab === "sign-in-with-multivrs"
                  ? "bg-foreground/[0.08] font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
              )}
            >
              Sign in with Multivrs
            </Link>
          </li>

          {/* Billing Information */}
          <li>
            <Link
              href="/account/settings?tab=billing-information"
              className={cn(
                "flex h-8 items-center rounded-md pl-9 pr-2.5 text-xs transition-colors",
                currentTab === "billing-information"
                  ? "bg-foreground/[0.08] font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
              )}
            >
              Billing Information
            </Link>
          </li>

          {/* Billing Items */}
          <li>
            <Link
              href="/account/settings?tab=billing-items"
              className={cn(
                "flex h-8 items-center rounded-md pl-9 pr-2.5 text-xs transition-colors",
                currentTab === "billing-items"
                  ? "bg-foreground/[0.08] font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
              )}
            >
              Billing Items
            </Link>
          </li>

          {/* Invoices */}
          <li className="mt-0.5">
            <Link
              href="/account/settings?tab=invoices"
              className={cn(
                "flex h-8 items-center gap-2.5 rounded-md px-2.5 text-xs transition-colors",
                currentTab === "invoices"
                  ? "bg-foreground/[0.08] font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
              )}
            >
              <FileText className="size-4 shrink-0 text-muted-foreground/70" strokeWidth={1.75} />
              <span>Invoices</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export function SidebarAccountNav() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <SidebarAccountNavContent />
    </Suspense>
  );
}
