"use client";

import Image from "next/image";
import { useState } from "react";
import { LiveBell } from "@/components/icons/animated";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AccountMenu } from "@/features/dashboard/components/AccountMenu";
import { NotificationsPanel } from "@/features/dashboard/components/NotificationsPanel";
import { SidebarSearch } from "@/features/dashboard/components/SidebarSearch";
import { useDashboardScope } from "@/features/dashboard/lib/useDashboardScope";
import type { DashboardNotification } from "@/features/dashboard/types/notification.types";
import type { DisplayPlan } from "@/lib/payments/billing.types";
import { cn } from "@/lib/utils";

interface TopbarActionsProps {
  user: { name: string; email: string; image?: string | null };
  notifications: DashboardNotification[];
  plan?: DisplayPlan;
}

const MENU =
  "dashboard-surface surface-card rounded-card border-hairline bg-ink p-0 font-hanken";

/** Search, notifications and the account menu at the right of the top bar. */
export function TopbarActions({
  user,
  notifications,
  plan,
}: TopbarActionsProps) {
  const [accountOpen, setAccountOpen] = useState(false);
  const { activeSlug } = useDashboardScope();
  // Mail brings its own search and Compose button into the bar.
  const isMail = activeSlug === "emails";
  const unread = notifications.some((item) => !item.read);
  const initial = (user.name?.[0] ?? "U").toUpperCase();

  return (
    <div
      className={cn(
        "hidden shrink-0 items-center gap-2 lg:flex",
        !isMail && "ml-auto",
      )}
    >
      {isMail ? null : (
        <div className="w-64 xl:w-72">
          <SidebarSearch />
        </div>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={unread ? "Notifications, unread" : "Notifications"}
          className="surface-raised surface-press relative flex size-9 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          data-icon-trigger
        >
          <LiveBell className="size-4" strokeWidth={1.75} />
          {unread ? (
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary ring-2 ring-ink" />
          ) : null}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className={cn(MENU, "w-85 overflow-hidden")}
          sideOffset={10}
        >
          <NotificationsPanel initialNotifications={notifications} />
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu onOpenChange={setAccountOpen} open={accountOpen}>
        <DropdownMenuTrigger
          aria-label="Account menu"
          className="surface-press rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {user.image ? (
            <Image
              alt=""
              className="size-9 rounded-full border border-hairline-strong object-cover"
              height={36}
              src={user.image}
              unoptimized
              width={36}
            />
          ) : (
            <span className="surface-raised flex size-9 items-center justify-center rounded-full font-geist-mono text-[12px] font-medium text-foreground">
              {initial}
            </span>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className={cn(MENU, "w-75 p-1.5")}
          sideOffset={10}
        >
          <AccountMenu
            email={user.email}
            name={user.name}
            onClose={() => setAccountOpen(false)}
            plan={plan}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
