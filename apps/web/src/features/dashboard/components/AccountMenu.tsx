"use client";

import {
  BookOpen,
  Home,
  LifeBuoy,
  LogOut,
  PenLine,
  Settings,
  SmilePlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { buildNavHref } from "@/features/dashboard/constants/navigation";
import { useDashboardScope } from "@/features/dashboard/lib/useDashboardScope";
import { authClient } from "@/lib/auth-client";
import type { PlanKey } from "@/lib/payments/billing.types";

interface AccountMenuProps {
  name: string;
  email: string;
  /** Plan of the workspace being viewed; only Hobby offers an upgrade. */
  plan?: PlanKey;
  onClose?: () => void;
}

const LINKS = [
  { label: "Home Page", href: "/home", icon: Home },
  { label: "Changelog", href: "/shipped", icon: PenLine },
  { label: "Help", href: "/help", icon: LifeBuoy },
  { label: "Docs", href: "/docs", icon: BookOpen },
] as const;

export function AccountMenu({ name, email, plan, onClose }: AccountMenuProps) {
  const router = useRouter();
  const { username, scope } = useDashboardScope();
  const settingsHref = buildNavHref(username, scope, "settings");

  const logOut = async () => {
    await authClient.signOut({
      fetchOptions: { onSuccess: () => router.push("/login") },
    });
  };

  return (
    <div className="text-[14px]">
      <Link
        href="/account/settings"
        onClick={onClose}
        className="group mx-1 my-1 flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-white/10 dark:hover:bg-white/10"
        aria-label="Account settings"
      >
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground group-hover:text-foreground">{name}</p>
          <p className="truncate text-[12px] text-muted-foreground">{email}</p>
        </div>
        <Settings className="size-4 shrink-0 text-muted-foreground/70 transition-colors group-hover:text-foreground" strokeWidth={1.75} />
      </Link>

      <DropdownMenuSeparator />

      <DropdownMenuItem className="rounded-lg">
        <SmilePlus className="text-muted-foreground" strokeWidth={1.75} />
        Feedback
      </DropdownMenuItem>

      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <span className="font-medium">Theme</span>
        <ThemeToggle />
      </div>

      {LINKS.map(({ label, href, icon: Icon }) => (
        <DropdownMenuItem key={label} className="rounded-lg" asChild>
          <Link href={href}>
            <Icon className="text-muted-foreground" strokeWidth={1.75} />
            {label}
          </Link>
        </DropdownMenuItem>
      ))}

      <DropdownMenuItem className="rounded-lg" onClick={logOut}>
        <LogOut className="text-muted-foreground" strokeWidth={1.75} />
        Log Out
      </DropdownMenuItem>

      {plan === "hobby" && (
        <div className="px-1.5 pt-1.5">
          <Button
            className="w-full h-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors text-xs flex items-center justify-center cursor-pointer shadow-xs"
            size="sm"
            onClick={() => {
              onClose?.();
              window.dispatchEvent(new CustomEvent("open-upgrade-sheet"));
            }}
          >
            Upgrade to Pro
          </Button>
        </div>
      )}

      {plan === "pro" && (
        <div className="px-1.5 pt-1.5">
          <Link
            href="/contact/sales"
            onClick={onClose}
            className={cn(
              buttonVariants({ size: "sm" }),
              "w-full h-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors text-xs flex items-center justify-center cursor-pointer shadow-xs",
            )}
          >
            Upgrade to Enterprise
          </Link>
        </div>
      )}

      <DropdownMenuSeparator />

      <div className="flex items-center justify-between px-3 py-1.5">
        <div>
          <p className="text-[12px] text-muted-foreground">Platform Status</p>
          <p className="text-[13px] text-primary">All systems normal.</p>
        </div>
        <span className="size-2 rounded-full bg-primary" />
      </div>
    </div>
  );
}
