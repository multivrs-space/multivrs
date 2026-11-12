import { StatusOrb } from "@/components/dashboard/StatusOrb";
import { LiveMail } from "@/components/icons/animated";
import {
  SettingsCard,
  SettingsCardBody,
  SettingsCardFooter,
} from "@/features/dashboard/components/settings/SettingsCard";

/** The address you sign in with and get account mail at. */
export function EmailCard({
  email,
  verified,
}: {
  email: string;
  verified: boolean;
}) {
  return (
    <SettingsCard id="email">
      <SettingsCardBody
        description="You sign in with it, and account notices are sent to it."
        icon={LiveMail}
        title="Email"
      >
        <div className="surface-inset flex max-w-md items-center gap-3 rounded-tile px-3.5 py-2.5">
          <span className="min-w-0 flex-1 truncate text-[13.5px] text-foreground">
            {email}
          </span>
          <StatusOrb
            label={verified ? "Verified" : "Not verified"}
            pill
            tone={verified ? "ready" : "building"}
          />
        </div>
      </SettingsCardBody>
      <SettingsCardFooter helperText="Adding more addresses to one account is planned." />
    </SettingsCard>
  );
}
