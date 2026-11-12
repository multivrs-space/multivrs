"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { CopyButton } from "@/components/CopyButton";
import { DASH_FIELD } from "@/components/dashboard/menu";
import {
  LiveAtSign,
  LiveKeyRound,
  LiveUserRound,
} from "@/components/icons/animated";
import { DeleteAccountCard } from "@/features/dashboard/components/account/general/DeleteAccountCard";
import { EmailCard } from "@/features/dashboard/components/account/general/EmailCard";
import { ProfileAvatarCard } from "@/features/dashboard/components/account/general/ProfileAvatarCard";
import {
  SettingsCard,
  SettingsCardBody,
} from "@/features/dashboard/components/settings/SettingsCard";
import { TextSettingCard } from "@/features/dashboard/components/settings/TextSettingCard";
import type { AccountDeletionBlocker } from "@/features/dashboard/types/account-security.types";
import { readableError, requestOk } from "@/lib/api/request.client";
import {
  type AccountProfile,
  accountProfileResponseSchema,
} from "@/lib/schemas/account.schemas";
import { cn } from "@/lib/utils";

interface AccountProfileFormProps {
  initialProfile: AccountProfile;
  userId?: string;
  emailVerified?: boolean;
  deletionBlockers?: AccountDeletionBlocker[];
}

/** Your profile and the account itself, as stacked cards. */
export function AccountProfileForm({
  initialProfile,
  userId,
  emailVerified = false,
  deletionBlockers = [],
}: AccountProfileFormProps) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);

  async function save(field: "name" | "username", value: string) {
    try {
      const response = await requestOk(
        "/api/account/profile",
        {
          body: JSON.stringify({
            name: field === "name" ? value : profile.name,
            username: field === "username" ? value : profile.username,
          }),
          headers: { "content-type": "application/json" },
          method: "PATCH",
        },
        "Profile update failed",
      );
      const updated = accountProfileResponseSchema.parse(await response.json());
      setProfile(updated);
      toast.success(
        field === "name" ? "Display name updated" : "Username updated",
      );
      if (updated.username !== initialProfile.username)
        router.replace(`/${updated.username}/~/settings`);
      router.refresh();
    } catch (error) {
      throw new Error(readableError(error, "Profile update failed"));
    }
  }

  return (
    <div className="space-y-3">
      <ProfileAvatarCard
        onChange={(updated) => {
          setProfile({ ...profile, image: updated.image });
          router.refresh();
        }}
        profile={profile}
      />
      <TextSettingCard
        description="Your full name, or a name you're comfortable with."
        hint="Up to 32 characters."
        icon={LiveUserRound}
        id="display-name"
        maxLength={32}
        onSave={(value) => save("name", value)}
        placeholder="Your name"
        title="Display name"
        value={profile.name}
      />
      <TextSettingCard
        clean={(value) => value.toLowerCase().replace(/[^a-z0-9_-]/g, "")}
        description="Your personal workspace address on Multivrs."
        hint="Up to 48 characters: lowercase letters, numbers, dashes and underscores."
        icon={LiveAtSign}
        id="username"
        maxLength={48}
        onSave={(value) => save("username", value)}
        placeholder="username"
        prefix="multivrs.space/"
        title="Username"
        value={profile.username}
      />
      <EmailCard email={profile.email} verified={emailVerified} />
      {userId ? (
        <SettingsCard id="user-id">
          <SettingsCardBody
            description="Use it when calling the Multivrs API as yourself."
            icon={LiveKeyRound}
            title="User ID"
          >
            <div className="flex max-w-md items-center gap-1">
              <input
                aria-label="User ID"
                className={cn(
                  DASH_FIELD,
                  "w-full border px-3 font-geist-mono text-[12px] text-muted-foreground",
                )}
                readOnly
                value={userId}
              />
              <CopyButton className="size-9" text={userId} />
            </div>
          </SettingsCardBody>
        </SettingsCard>
      ) : null}
      <DeleteAccountCard
        blockers={deletionBlockers}
        email={profile.email}
        username={profile.username}
      />
    </div>
  );
}
