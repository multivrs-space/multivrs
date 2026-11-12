"use client";

import { useRouter } from "next/navigation";
import { CopyButton } from "@/components/CopyButton";
import { DASH_FIELD } from "@/components/dashboard/menu";
import {
  LiveGlobe,
  LiveImage,
  LiveKeyRound,
  LiveLink,
  LiveTrash,
  LiveUsers,
} from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import {
  SettingsBadge,
  SettingsCard,
  SettingsCardBody,
  SettingsCardFooter,
} from "@/features/dashboard/components/settings/SettingsCard";
import { TextSettingCard } from "@/features/dashboard/components/settings/TextSettingCard";
import { TeamAvatarField } from "@/features/dashboard/components/team/TeamAvatarField";
import { updateTeam } from "@/features/dashboard/components/team/team-requests";
import type { AccountTeam } from "@/lib/services/account-team.service";
import { cn } from "@/lib/utils";

/** Name, address, avatar and ID, then what's planned and what can't be undone. */
export function TeamGeneralSettings({
  team,
  username,
  onTeam,
}: {
  team: AccountTeam;
  username: string;
  onTeam: (team: AccountTeam) => void;
}) {
  const router = useRouter();
  return (
    <div className="space-y-3">
      <TextSettingCard
        description="Your team's name across Multivrs, such as your company or department."
        hint="Up to 32 characters."
        icon={LiveUsers}
        id="team-name"
        maxLength={32}
        onSave={async (name) => {
          onTeam(await updateTeam({ name }, "Failed to update team name"));
          router.refresh();
        }}
        placeholder="Acme Corp"
        title="Team name"
        value={team.name}
      />
      <TextSettingCard
        clean={(value) => value.toLowerCase().replace(/[^a-z0-9-]/g, "")}
        description="The address your team's projects, activity and settings live under."
        hint="Up to 48 characters: lowercase letters, numbers and dashes."
        icon={LiveLink}
        id="team-url"
        maxLength={48}
        onSave={async (slug) => {
          const updated = await updateTeam(
            { slug },
            "Failed to update team URL",
          );
          onTeam(updated);
          if (updated.slug !== username)
            router.replace(`/${updated.slug}/~/settings`);
          router.refresh();
        }}
        placeholder="my-team"
        prefix="multivrs.space/"
        title="Team URL"
        value={team.slug}
      />
      <SettingsCard id="team-avatar">
        <SettingsCardBody
          aside={
            <TeamAvatarField
              onChange={(updated) => {
                onTeam(updated);
                router.refresh();
              }}
              team={team}
            />
          }
          description="Shown beside your team's name. Square images work best."
          icon={LiveImage}
          title="Team avatar"
        />
        <SettingsCardFooter helperText="Optional, but it helps people spot the right team." />
      </SettingsCard>
      <SettingsCard id="team-id">
        <SettingsCardBody
          description="Use it when calling the Multivrs API for this team."
          icon={LiveKeyRound}
          title="Team ID"
        >
          <div className="flex max-w-md items-center gap-1">
            <input
              aria-label="Team ID"
              className={cn(
                DASH_FIELD,
                "w-full border px-3 font-geist-mono text-[12px] text-muted-foreground",
              )}
              readOnly
              value={team.id}
            />
            <CopyButton className="size-9" text={team.id} />
          </div>
        </SettingsCardBody>
      </SettingsCard>
      <SettingsCard id="preview-suffix">
        <SettingsCardBody
          badge={<SettingsBadge>Planned</SettingsBadge>}
          description="Every preview deployment ends in multivrs.app today. Using your own domain as the suffix is planned."
          icon={LiveGlobe}
          title="Preview deployment suffix"
        >
          <p
            className={cn(
              DASH_FIELD,
              "flex max-w-md items-center border px-3 font-geist-mono text-[12px] text-muted-foreground",
            )}
          >
            my-deployment.<span className="text-foreground">multivrs.app</span>
          </p>
        </SettingsCardBody>
      </SettingsCard>
      <SettingsCard danger id="delete-team">
        <SettingsCardBody
          description="Removes the team with its deployments, resources and domains. This can't be undone."
          icon={LiveTrash}
          title="Delete team"
        />
        <SettingsCardFooter
          action={
            <Button disabled size="sm" variant="danger">
              Delete team
            </Button>
          }
          danger
          helperText="Deleting a team isn't available yet. Remove projects and members to wind it down."
        />
      </SettingsCard>
    </div>
  );
}
