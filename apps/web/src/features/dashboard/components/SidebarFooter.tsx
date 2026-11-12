"use client";

import { MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { DASH_MENU } from "@/components/dashboard/menu";
import { LiveBell } from "@/components/icons/animated";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DashboardNotification } from "@/features/dashboard/types/notification.types";
import type { DisplayPlan } from "@/lib/payments/billing.types";
import { cn } from "@/lib/utils";
import { AccountMenu } from "./AccountMenu";
import { NotificationsPanel } from "./NotificationsPanel";

interface SidebarFooterProps {
  name: string;
  email: string;
  image?: string | null;
  notifications: DashboardNotification[];
  plan?: DisplayPlan;
}

const ROUND_KEY =
  "surface-raised surface-press relative grid size-8 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring";

/** The viewer, their menu and notifications, at the foot of the mobile sheet. */
export function SidebarFooter({
  name,
  email,
  image,
  notifications,
  plan,
}: SidebarFooterProps) {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const initial = (name?.[0] ?? "U").toUpperCase();

  return (
    <div className="flex items-center gap-2 border-t border-hairline px-4 py-3">
      {image ? (
        <Image
          alt=""
          className="size-8 shrink-0 rounded-full border border-hairline-strong object-cover"
          height={32}
          src={image}
          unoptimized
          width={32}
        />
      ) : (
        <span className="surface-inset grid size-8 shrink-0 place-items-center rounded-full font-geist-mono text-[12px] font-medium text-foreground">
          {initial}
        </span>
      )}
      <span className="flex-1 truncate text-[13.5px] font-medium tracking-[-0.01em] text-foreground">
        {name}
      </span>

      <DropdownMenu onOpenChange={setAccountMenuOpen} open={accountMenuOpen}>
        <DropdownMenuTrigger aria-label="Account menu" className={ROUND_KEY}>
          <MoreHorizontal className="size-4" strokeWidth={1.75} />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className={cn(DASH_MENU, "w-75")}
          side="top"
          sideOffset={10}
        >
          <AccountMenu
            email={email}
            name={name}
            onClose={() => setAccountMenuOpen(false)}
            plan={plan}
          />
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Notifications"
          className={ROUND_KEY}
          data-icon-trigger
        >
          <LiveBell className="size-4" strokeWidth={1.75} />
          {notifications.some((item) => !item.read) ? (
            <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary ring-2 ring-ink" />
          ) : null}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className={cn(DASH_MENU, "w-85 overflow-hidden p-0")}
          side="top"
          sideOffset={10}
        >
          <NotificationsPanel initialNotifications={notifications} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
