"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { DASH_MENU_ITEM } from "@/components/dashboard/menu";
import {
  LiveBookOpen,
  LiveFileText,
  LiveGlobe,
  LiveLifeBuoy,
  LiveLogOut,
  LiveSettings,
  LiveSparkles,
} from "@/components/icons/animated";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import type { DisplayPlan } from "@/lib/payments/billing.types";

interface AccountMenuProps {
  name: string;
  email: string;
  /** Plan of the workspace being viewed; only Hobby offers an upgrade. */
  plan?: DisplayPlan;
  onClose?: () => void;
}

const LINKS = [
  { label: "Home page", href: "/home", icon: LiveGlobe },
  { label: "Changelog", href: "/shipped", icon: LiveFileText },
  { label: "Help", href: "/help", icon: LiveLifeBuoy },
  { label: "Docs", href: "/docs", icon: LiveBookOpen },
] as const;

const UPGRADE =
  "surface-hero surface-press flex h-9 w-full items-center justify-center gap-2 rounded-control text-[13px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function AccountMenu({ name, email, plan, onClose }: AccountMenuProps) {
  const router = useRouter();

  const logOut = async () => {
    await authClient.signOut({
      fetchOptions: { onSuccess: () => router.push("/login") },
    });
  };

  return (
    <div className="text-[13px]">
      <Link
        aria-label="Account settings"
        className="group flex items-center gap-3 rounded-tile p-2.5 outline-none transition-colors hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-ring"
        data-icon-trigger
        href="/account/settings"
        onClick={onClose}
      >
        <span className="surface-inset grid size-9 shrink-0 place-items-center rounded-full font-geist-mono text-[12px] font-medium text-foreground">
          {(name?.[0] ?? "U").toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-foreground">
            {name}
          </span>
          <span className="block truncate text-[12px] text-muted-foreground">
            {email}
          </span>
        </span>
        <LiveSettings
          className="size-4 shrink-0 text-muted-foreground"
          strokeWidth={1.75}
        />
      </Link>

      <DropdownMenuSeparator className="mx-0 my-1.5 bg-hairline" />

      <div className="flex items-center justify-between gap-2 px-2.5 py-1.5">
        <span className="text-muted-foreground">Theme</span>
        <ThemeToggle />
      </div>
      {LINKS.map(({ label, href, icon: Icon }) => (
        <DropdownMenuItem
          asChild
          className={DASH_MENU_ITEM}
          data-icon-trigger
          key={label}
        >
          <Link href={href}>
            <Icon strokeWidth={1.75} />
            {label}
          </Link>
        </DropdownMenuItem>
      ))}
      <DropdownMenuItem
        className={DASH_MENU_ITEM}
        data-icon-trigger
        onClick={logOut}
      >
        <LiveLogOut strokeWidth={1.75} />
        Log out
      </DropdownMenuItem>

      {plan === "hobby" ? (
        <div className="px-1 pt-2">
          <button
            className={UPGRADE}
            data-icon-trigger
            onClick={() => {
              onClose?.();
              window.dispatchEvent(new CustomEvent("open-upgrade-sheet"));
            }}
            type="button"
          >
            <LiveSparkles className="size-4" strokeWidth={1.75} />
            Upgrade to Pro
          </button>
        </div>
      ) : null}
      {plan === "pro" ? (
        <div className="px-1 pt-2">
          <Link
            className={UPGRADE}
            data-icon-trigger
            href="/contact/sales"
            onClick={onClose}
          >
            <LiveSparkles className="size-4" strokeWidth={1.75} />
            Upgrade to Enterprise
          </Link>
        </div>
      ) : null}
    </div>
  );
}
