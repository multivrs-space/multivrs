"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, use } from "react";
import { LiveAtSign, LivePlus } from "@/components/icons/animated";
import {
  ContextNavGroup,
  ContextNavHeader,
  ContextNavItem,
  ContextNavList,
} from "@/features/dashboard/components/shell/ContextNav";
import { useDashboardScope } from "@/features/dashboard/lib/useDashboardScope";
import type { MailDashboardData } from "@/features/mail/mail.types";
import {
  useGlobalMailStore,
  useOptionalMailContext,
} from "@/features/mail/mail-context";
import {
  MAIL_NAVIGATION,
  type MailView,
} from "@/features/mail/mail-navigation";

const COMPOSE =
  "surface-hero surface-press flex h-9 w-full items-center justify-center gap-2 rounded-control text-[13px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring";

/**
 * Mail's own navigation in the context panel: folders, sending tools and
 * infrastructure, with live folder counts once the mailbox data arrives.
 */
export function SidebarMailNav({
  onLinkClick,
  onBack,
}: {
  onLinkClick?: () => void;
  onBack?: () => void;
} = {}) {
  const pathname = usePathname();
  const { username, scope } = useDashboardScope();
  const localContext = useOptionalMailContext();
  const globalContext = useGlobalMailStore();
  const ctx = localContext ?? globalContext;

  const backHref = scope === "~" ? `/${username}` : `/${username}/${scope}`;
  const routeView = pathname.includes("/email/domains/")
    ? "domains"
    : "overview";
  const view = ctx?.view ?? routeView;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ContextNavHeader
        backHref={backHref}
        icon={LiveAtSign}
        onBack={onBack}
        title="Mail"
      >
        {ctx ? (
          <button
            className={COMPOSE}
            data-icon-trigger
            onClick={() => {
              ctx.openCompose();
              onLinkClick?.();
            }}
            type="button"
          >
            <LivePlus className="size-4" strokeWidth={2} />
            Compose
          </button>
        ) : (
          <Link
            className={COMPOSE}
            data-icon-trigger
            href={`/${username}/${scope}/emails?view=inbox&compose=1`}
            onClick={() => onLinkClick?.()}
          >
            <LivePlus className="size-4" strokeWidth={2} />
            Compose
          </Link>
        )}
      </ContextNavHeader>

      <ContextNavList>
        {MAIL_NAVIGATION.map((item) => {
          if ("divider" in item) {
            return <ContextNavGroup key={item.divider} label={item.divider} />;
          }
          const countKey = "count" in item && ctx ? item.count : undefined;
          return (
            <ContextNavItem
              active={view === item.view}
              href={`/${username}/${scope}/emails?view=${item.view}`}
              icon={item.icon}
              key={item.view}
              label={item.label}
              onClick={(event) => {
                if (ctx) {
                  event.preventDefault();
                  ctx.setView(item.view as MailView);
                }
                onLinkClick?.();
              }}
              trailing={
                countKey && ctx ? (
                  <Suspense fallback={null}>
                    <FolderCount folder={countKey} shell={ctx.shell} />
                  </Suspense>
                ) : null
              }
            />
          );
        })}
      </ContextNavList>
    </div>
  );
}

/** A folder's count, shown once the shared mail data arrives. */
function FolderCount({
  folder,
  shell,
}: {
  folder: string;
  shell: Promise<MailDashboardData>;
}) {
  const count = use(shell).folderCounts[folder];
  return count ? (
    <span className="figure ml-auto rounded-full bg-foreground/6 px-1.5 font-geist-mono text-[10px] leading-4 text-muted-foreground">
      {count}
    </span>
  ) : null;
}
