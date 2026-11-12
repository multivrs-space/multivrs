"use client";

import Link from "next/link";
import { useState } from "react";
import { DASH_FIELD } from "@/components/dashboard/menu";
import {
  LiveArrowUpRight,
  LiveNetwork,
  LiveUsers,
  LiveUsersRound,
} from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import {
  SettingsCard,
  SettingsCardBody,
} from "@/features/dashboard/components/settings/SettingsCard";
import { TeamInviteCard } from "@/features/dashboard/components/team/TeamInviteCard";
import { useTeamState } from "@/features/dashboard/components/team/useTeamState";
import { WorkspaceMembers } from "@/features/dashboard/components/WorkspaceMembers";
import { useWorkspaceMembers } from "@/features/dashboard/hooks/useWorkspaceMembers";
import { cn } from "@/lib/utils";

/**
 * Your account's team: people you invite open and work on all your
 * projects, with the role you give them. There's nothing to create first.
 */
export function TeamManager() {
  const { state, loading, invite, adopt, adoptable, others } = useTeamState();
  const [otherId, setOtherId] = useState("");
  const members = useWorkspaceMembers(state?.team?.id ?? "");
  const other = useWorkspaceMembers(otherId);

  return (
    <div className="space-y-3">
      {adoptable.map((workspace) => (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-card bg-primary/[0.06] p-4 ring-1 ring-primary/20 ring-inset"
          key={workspace.id}
        >
          <p className="max-w-xl text-[13px] text-foreground/85">
            You invited people to “{workspace.name}” before teams existed. Make
            it your team so they can open your projects, with no new invites
            needed.
          </p>
          <Button
            disabled={loading}
            onClick={() => void adopt(workspace.id)}
            size="sm"
            variant="hero"
          >
            Make it my team
          </Button>
        </div>
      ))}
      <TeamInviteCard
        disabled={loading || !state}
        onInvite={async (email, role) => {
          const sent = await invite(email, role);
          if (sent) await members.reload();
          return sent;
        }}
      />
      <SettingsCard id="member-list">
        <SettingsCardBody
          description="Everyone with access to this account's projects."
          icon={LiveUsers}
          title="Members"
        >
          {state?.team ? (
            <WorkspaceMembers
              organizationId={state.team.id}
              workspace={members}
            />
          ) : (
            <p className="text-[13px] text-muted-foreground">
              It's just you for now. Invite someone above.
            </p>
          )}
        </SettingsCardBody>
      </SettingsCard>
      {state?.joined.length ? (
        <SettingsCard id="teams-joined">
          <SettingsCardBody
            description="Other accounts that invited you."
            icon={LiveUsersRound}
            title="Teams you're on"
          >
            <ul className="divide-y divide-hairline">
              {state.joined.map((team) => (
                <li
                  className="flex items-center justify-between gap-3 py-3"
                  key={team.organizationId}
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-medium">
                      {team.name}
                    </p>
                    <p className="text-[12px] capitalize text-muted-foreground">
                      {team.role}
                    </p>
                  </div>
                  <Link
                    className="flex items-center gap-1 text-[13px] font-medium text-primary"
                    data-icon-trigger
                    href={`/${team.username}`}
                  >
                    Open{" "}
                    <LiveArrowUpRight className="size-3.5" strokeWidth={2} />
                  </Link>
                </li>
              ))}
            </ul>
          </SettingsCardBody>
        </SettingsCard>
      ) : null}
      {others.length ? (
        <SettingsCard id="other-workspaces">
          <SettingsCardBody
            description="Workspaces from before teams, still managed here."
            icon={LiveNetwork}
            title="Other workspaces"
          >
            <select
              aria-label="Workspace"
              className={cn(DASH_FIELD, "mb-4 w-full max-w-md border px-3")}
              onChange={(event) => setOtherId(event.target.value)}
              value={otherId}
            >
              <option value="">Choose a workspace to manage</option>
              {others.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </option>
              ))}
            </select>
            {otherId ? (
              <WorkspaceMembers organizationId={otherId} workspace={other} />
            ) : null}
          </SettingsCardBody>
        </SettingsCard>
      ) : null}
    </div>
  );
}
