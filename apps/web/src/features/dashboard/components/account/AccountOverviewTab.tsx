"use client";

import Link from "next/link";
import { useState } from "react";
import { DASH_FIELD } from "@/components/dashboard/menu";
import {
  LiveArrowUpRight,
  LivePlus,
  LiveSearch,
  LiveSettings,
  LiveUsers,
} from "@/components/icons/animated";
import { TeamAvatar } from "@/components/TeamAvatar";
import { Button } from "@/components/ui/button";
import { CreateTeamDialog } from "@/features/dashboard/components/CreateTeamDialog";
import {
  SettingsCard,
  SettingsCardBody,
} from "@/features/dashboard/components/settings/SettingsCard";
import { cn } from "@/lib/utils";

export interface AccountTeamOverviewItem {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  plan?: string;
  status?: string;
  role?: string;
}

const PLAN: Record<string, string> = {
  enterprise: "Enterprise",
  pro: "Pro",
  hobby: "Hobby",
};

/** Every team your account belongs to, with its plan and your role. */
export function AccountOverviewTab({
  teams = [],
}: {
  teams?: AccountTeamOverviewItem[];
}) {
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const needle = search.trim().toLowerCase();
  const shown = teams.filter((team) =>
    `${team.name} ${team.slug}`.toLowerCase().includes(needle),
  );

  return (
    <SettingsCard id="teams">
      <SettingsCardBody
        aside={
          <Button
            data-icon-trigger
            onClick={() => setCreating(true)}
            size="sm"
            variant="hero"
          >
            <LivePlus strokeWidth={2} />
            New team
          </Button>
        }
        description="Every team this account is on, with its plan and your role."
        icon={LiveUsers}
        title="Teams"
      >
        {teams.length > 4 ? (
          <label
            className={cn(
              DASH_FIELD,
              "mb-3 flex max-w-sm items-center gap-2 border px-3",
            )}
          >
            <LiveSearch
              className="size-3.5 text-muted-foreground"
              strokeWidth={2}
            />
            <input
              aria-label="Find a team"
              className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground/60"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Find a team"
              value={search}
            />
          </label>
        ) : null}
        {shown.length ? (
          <ul className="divide-y divide-hairline">
            {shown.map((team) => (
              <li
                className="flex items-center gap-3 py-3"
                key={team.id || team.slug}
              >
                <TeamAvatar
                  logo={team.logo}
                  name={team.name || team.slug}
                  size={36}
                />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate text-[13.5px] font-medium">
                    {team.name || team.slug}
                    <span className="rounded-full border border-hairline px-2 text-[10.5px] font-medium text-muted-foreground">
                      {PLAN[(team.plan ?? "hobby").toLowerCase()] ?? "Hobby"}
                    </span>
                  </p>
                  <p className="text-[12px] capitalize text-muted-foreground">
                    {team.role ?? "Owner"}
                  </p>
                </div>
                <Link
                  aria-label={`${team.name} settings`}
                  className="surface-raised surface-press grid size-8 place-items-center rounded-full text-muted-foreground hover:text-foreground"
                  data-icon-trigger
                  href={`/${team.slug}/~/settings`}
                  title="Team settings"
                >
                  <LiveSettings className="size-3.5" strokeWidth={1.75} />
                </Link>
                <Link
                  aria-label={`Open ${team.name}`}
                  className="surface-raised surface-press grid size-8 place-items-center rounded-full text-muted-foreground hover:text-foreground"
                  data-icon-trigger
                  href={`/${team.slug}`}
                  title="Open workspace"
                >
                  <LiveArrowUpRight className="size-3.5" strokeWidth={2} />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-6 text-center text-[13px] text-muted-foreground">
            {needle
              ? `No team matches “${search.trim()}”.`
              : "This account isn't on any team yet."}
          </p>
        )}
      </SettingsCardBody>
      <CreateTeamDialog onOpenChange={setCreating} open={creating} />
    </SettingsCard>
  );
}
