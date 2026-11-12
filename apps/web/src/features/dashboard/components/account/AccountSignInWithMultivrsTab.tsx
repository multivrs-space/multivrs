import { EmptyState } from "@/components/dashboard/EmptyState";
import { LiveUserRound } from "@/components/icons/animated";
import {
  SettingsBadge,
  SettingsCard,
  SettingsCardBody,
} from "@/features/dashboard/components/settings/SettingsCard";

/**
 * Apps that use your Multivrs account to sign you in. There's no provider
 * behind it yet, so this says what it will do rather than list nothing.
 */
export function AccountSignInWithMultivrsTab() {
  return (
    <SettingsCard id="connected-apps">
      <SettingsCardBody
        badge={<SettingsBadge>Planned</SettingsBadge>}
        description="Let other apps sign you in with your Multivrs account, and see or remove the ones you've allowed."
        icon={LiveUserRound}
        title="Connected apps"
      />
      <EmptyState
        className="pt-2"
        description="When apps can sign you in with Multivrs, each one you allow shows here with what it can see and a way to disconnect it."
        glyph={LiveUserRound}
        title="No connected apps"
      />
    </SettingsCard>
  );
}
