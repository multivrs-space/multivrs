"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DASH_MENU, DASH_MENU_ITEM } from "@/components/dashboard/menu";
import { LivePlus, LiveUsers } from "@/components/icons/animated";
import { TeamAvatar } from "@/components/TeamAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateTeamDialog } from "@/features/dashboard/components/CreateTeamDialog";
import { DashboardSearchInput } from "@/features/dashboard/components/DashboardSearchInput";
import type {
  CurrentWorkspace,
  DashboardWorkspace,
} from "@/features/dashboard/types/workspace.types";
import type { DisplayPlan } from "@/lib/payments/billing.types";
import { cn } from "@/lib/utils";

const PLAN_LABELS: Record<DisplayPlan, string> = {
  hobby: "Hobby",
  pro: "Pro",
  enterprise: "Enterprise",
  unlimited: "Unlimited",
};

interface WorkspaceSwitcherProps {
  workspace: CurrentWorkspace;
  /** Your own account first, then teams you're on. */
  workspaces: DashboardWorkspace[];
  /** Avatar-only trigger for the collapsed rail. */
  compact?: boolean;
}

function PlanPill({ plan }: { plan?: DisplayPlan | null }) {
  if (!plan) return null;
  return (
    <span className="shrink-0 rounded-full bg-foreground/6 px-1.5 py-px text-[10px] font-medium text-muted-foreground">
      {PLAN_LABELS[plan] ?? plan}
    </span>
  );
}

export function WorkspaceSwitcher({
  workspace,
  workspaces,
  compact = false,
}: WorkspaceSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const others = workspaces.filter((w) => w.username !== workspace.username);
  const needle = query.trim().toLowerCase();
  const matches = needle
    ? others.filter(
        (w) =>
          w.name?.toLowerCase().includes(needle) ||
          w.username.toLowerCase().includes(needle),
      )
    : others;
  const label = workspace.name || workspace.username;

  return (
    <>
      <DropdownMenu onOpenChange={setOpen} open={open}>
        {compact ? (
          <DropdownMenuTrigger
            aria-label="Switch workspace"
            className="surface-raised surface-press mx-auto flex size-10 cursor-pointer items-center justify-center rounded-control outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title={label}
          >
            <TeamAvatar image={workspace.image} name={label} size={22} />
          </DropdownMenuTrigger>
        ) : (
          <DropdownMenuTrigger
            aria-label="Switch workspace"
            className="surface-press flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-control px-2 text-left outline-none transition-colors hover:bg-foreground/4 focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-foreground/5"
          >
            <TeamAvatar image={workspace.image} name={label} size={24} />
            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold tracking-[-0.01em] text-foreground">
              {label}
            </span>
            <PlanPill plan={workspace.plan} />
            <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground/70" />
          </DropdownMenuTrigger>
        )}

        <DropdownMenuContent
          align="start"
          className={cn(DASH_MENU, "w-72")}
          sideOffset={6}
        >
          <DashboardSearchInput
            onKeyDown={(event) => {
              event.stopPropagation();
              if (event.key === "Escape") setOpen(false);
            }}
            onValueChange={setQuery}
            placeholder="Find team…"
            size="sm"
            value={query}
          />
          <div className="mt-1.5 flex items-center gap-2.5 rounded-control bg-foreground/5 px-2.5 py-2 text-[13px]">
            <TeamAvatar image={workspace.image} name={label} size={20} />
            <span className="min-w-0 flex-1 truncate font-medium">{label}</span>
            <PlanPill plan={workspace.plan} />
            <Check className="size-4 shrink-0 text-primary" />
          </div>
          {matches.length ? (
            <div className="mt-0.5 space-y-0.5">
              {matches.map((item) => (
                <DropdownMenuItem
                  asChild
                  className={DASH_MENU_ITEM}
                  key={item.username}
                >
                  <Link
                    href={`/${item.username}`}
                    onClick={() => setOpen(false)}
                  >
                    <TeamAvatar
                      image={item.image}
                      name={item.name || item.username}
                      size={20}
                    />
                    <span className="min-w-0 flex-1 truncate text-foreground">
                      {item.name || item.username}
                    </span>
                    <PlanPill plan={item.plan} />
                  </Link>
                </DropdownMenuItem>
              ))}
            </div>
          ) : needle ? (
            <p className="py-4 text-center text-xs text-muted-foreground">
              No team matches “{query}”.
            </p>
          ) : (
            <div
              className="flex flex-col items-center px-4 py-5 text-center"
              data-icon-trigger
            >
              <span className="surface-inset mb-2.5 grid size-9 place-items-center rounded-tile text-muted-foreground">
                <LiveUsers className="size-4" strokeWidth={1.75} />
              </span>
              <p className="max-w-[210px] text-xs leading-relaxed text-muted-foreground">
                Teams you create or join appear here for quick switching.
              </p>
            </div>
          )}
          <DropdownMenuSeparator className="mx-0 my-1.5 bg-hairline" />
          <DropdownMenuItem
            className={cn(DASH_MENU_ITEM, "items-start")}
            data-icon-trigger
            onSelect={() => setCreating(true)}
          >
            <LivePlus className="mt-0.5 size-4" strokeWidth={1.75} />
            <span>
              <span className="block font-medium text-foreground">
                Create team
              </span>
              <span className="block text-[11px]">
                Work together in a shared workspace
              </span>
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateTeamDialog onOpenChange={setCreating} open={creating} />
    </>
  );
}
