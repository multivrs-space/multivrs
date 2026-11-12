import Link from "next/link";
import { type OrbTone, StatusOrb } from "@/components/dashboard/StatusOrb";
import { LiveArrowUpRight, LiveCreditCard } from "@/components/icons/animated";
import { TeamAvatar } from "@/components/TeamAvatar";
import {
  SettingsCard,
  SettingsCardBody,
} from "@/features/dashboard/components/settings/SettingsCard";

export interface TeamItem {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  plan?: string;
  status?: string;
}

const PLAN: Record<string, string> = {
  enterprise: "Enterprise",
  pro: "Pro",
  hobby: "Hobby",
};
const STATUS: Record<string, { label: string; tone: OrbTone }> = {
  active: { label: "Active", tone: "ready" },
  trialing: { label: "Trial", tone: "ready" },
  past_due: { label: "Past due", tone: "error" },
  unpaid: { label: "Unpaid", tone: "error" },
  canceled: { label: "Canceled", tone: "idle" },
};

/** What each team you're on pays for; its billing lives in team settings. */
export function AccountBillingItemsTab({ teams = [] }: { teams?: TeamItem[] }) {
  return (
    <SettingsCard id="billing-items">
      <SettingsCardBody
        description="Each team is billed on its own. Open one to change its plan or add-ons."
        icon={LiveCreditCard}
        title="Plans by team"
      >
        {teams.length ? (
          <ul className="divide-y divide-hairline">
            {teams.map((team) => {
              const raw = (team.status ?? "active").toLowerCase();
              const state = STATUS[raw] ?? {
                label: raw,
                tone: "idle" as const,
              };
              return (
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
                    <p className="truncate text-[13.5px] font-medium">
                      {team.name || team.slug}
                    </p>
                    <p className="text-[12px] text-muted-foreground">
                      {PLAN[(team.plan ?? "hobby").toLowerCase()] ?? "Hobby"}{" "}
                      plan
                    </p>
                  </div>
                  <StatusOrb label={state.label} pill tone={state.tone} />
                  <Link
                    aria-label={`${team.name} billing`}
                    className="surface-raised surface-press grid size-8 place-items-center rounded-full text-muted-foreground hover:text-foreground"
                    data-icon-trigger
                    href={`/${team.slug}/~/settings#billing`}
                    title="Billing settings"
                  >
                    <LiveArrowUpRight className="size-3.5" strokeWidth={2} />
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="py-6 text-center text-[13px] text-muted-foreground">
            You aren't on any team yet.
          </p>
        )}
      </SettingsCardBody>
    </SettingsCard>
  );
}
