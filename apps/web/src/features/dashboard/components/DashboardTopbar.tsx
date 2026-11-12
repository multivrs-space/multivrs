"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  type AnimatedIcon,
  LiveLayoutGrid,
  LivePlus,
} from "@/components/icons/animated";
import { DashboardSearchInput } from "@/features/dashboard/components/DashboardSearchInput";
import {
  DASHBOARD_NAV_ITEMS,
  NEW_PROJECT_SLUG,
} from "@/features/dashboard/constants/navigation";
import { useDashboardScope } from "@/features/dashboard/lib/useDashboardScope";
import { useGlobalMailStore } from "@/features/mail/mail-context";
import {
  type ProjectOption,
  ProjectScopeSwitcher,
} from "./ProjectScopeSwitcher";

interface DashboardTopbarProps {
  mobileNavigation?: React.ReactNode;
  projects?: ProjectOption[];
  /** Right-hand cluster (search, notifications, account) in the rail shell. */
  actions?: React.ReactNode;
}

const ACCOUNT_TITLES: Record<string, string> = {
  overview: "Overview",
  activity: "Activity",
  invites: "Invites",
  authentication: "Authentication",
  "sign-in-with-multivrs": "Sign in with Multivrs",
  "billing-information": "Billing information",
  "billing-items": "Billing items",
  invoices: "Invoices",
  tokens: "Tokens",
  sessions: "Sessions",
};

function AccountTopbarTitle() {
  const tab = useSearchParams().get("tab");
  return <Crumb label={(tab && ACCOUNT_TITLES[tab]) || "Settings"} />;
}

function Crumb({ label, icon: Icon }: { label: string; icon?: AnimatedIcon }) {
  return (
    <span
      className="flex min-w-0 items-center gap-2 text-[13px] font-medium text-foreground"
      data-icon-trigger
    >
      {Icon ? (
        <Icon
          className="size-4 shrink-0 text-muted-foreground"
          strokeWidth={1.75}
        />
      ) : null}
      <span className="truncate">{label}</span>
    </span>
  );
}

function Slash() {
  return (
    <span
      aria-hidden="true"
      className="select-none font-geist-mono text-[13px] text-muted-foreground/35"
    >
      /
    </span>
  );
}

/**
 * The bar across the top of the canvas: where you are (project switcher and
 * section, with the section's own icon) and, on the right, the page's tools.
 */
export function DashboardTopbar({
  mobileNavigation,
  projects,
  actions,
}: DashboardTopbarProps) {
  const pathname = usePathname();
  const { activeSlug } = useDashboardScope();
  const isAccount = pathname.startsWith("/account");
  const isTeamSettings = activeSlug === "settings";
  const sectionSlug = activeSlug === "email" ? "emails" : activeSlug;
  const item = DASHBOARD_NAV_ITEMS.find((i) => i.slug === sectionSlug);
  const mailStore = useGlobalMailStore();

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full min-w-0 max-w-full items-center gap-2.5 border-b border-hairline bg-ink/75 px-3 backdrop-blur-xl backdrop-saturate-150 sm:px-5">
      {mobileNavigation}

      <div className="flex min-w-0 items-center gap-2.5">
        {isAccount ? (
          <Suspense fallback={<Crumb label="Settings" />}>
            <AccountTopbarTitle />
          </Suspense>
        ) : (
          <>
            <ProjectScopeSwitcher projects={projects} />
            <Slash />
            {isTeamSettings ? (
              <Crumb label="Team settings" />
            ) : activeSlug === NEW_PROJECT_SLUG ? (
              <Crumb icon={LivePlus} label="New project" />
            ) : (
              <Crumb
                icon={item?.icon ?? LiveLayoutGrid}
                label={item?.name ?? "Overview"}
              />
            )}
          </>
        )}
      </div>

      {activeSlug === "emails" && mailStore ? (
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <DashboardSearchInput
            aria-label="Search mail"
            containerClassName="hidden sm:flex sm:w-72 md:w-96 lg:w-[420px]"
            onValueChange={mailStore.setQuery}
            placeholder="Search mail and resources"
            size="sm"
            value={mailStore.query}
          />
          <button
            className="surface-hero surface-press flex h-8 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3.5"
            data-icon-trigger
            onClick={mailStore.openCompose}
            type="button"
          >
            <LivePlus className="size-4" strokeWidth={2} />
            <span className="hidden sm:inline">Compose</span>
          </button>
        </div>
      ) : null}
      {actions}
    </header>
  );
}
