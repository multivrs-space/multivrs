"use client";

import Image from "next/image";
import Link from "next/link";
import { TeamAvatar } from "@/components/TeamAvatar";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  SettingsCard,
  SettingsCardBody,
  SettingsCardFooter,
} from "@/features/dashboard/components/settings/SettingsCard";
import { cn } from "@/lib/utils";

export interface TeamItem {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  plan?: string;
  status?: string;
}

interface AccountBillingItemsTabProps {
  teams?: TeamItem[];
}

export function AccountBillingItemsTab({
  teams = [],
}: AccountBillingItemsTabProps) {
  return (
    <div className="space-y-8">
      {/* Teams Section */}
      <div>
        <h2 className="text-sm font-semibold text-white tracking-tight mb-3">
          Teams
        </h2>
        {teams.length > 0 ? (
          <div className="space-y-4">
            {teams.map((team) => {
              const planLabel = (team.plan || "hobby").toLowerCase();
              const formattedPlan =
                planLabel === "enterprise"
                  ? "Enterprise"
                  : planLabel === "pro"
                  ? "Pro"
                  : "Hobby";

              const rawStatus = (team.status || "active").toLowerCase();
              const formattedStatus =
                rawStatus === "active"
                  ? "Active"
                  : rawStatus === "trialing"
                  ? "Trial"
                  : rawStatus === "past_due"
                  ? "Past Due"
                  : rawStatus === "canceled"
                  ? "Canceled"
                  : rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);

              const statusBadgeClass =
                rawStatus === "active" || rawStatus === "trialing"
                  ? "border-emerald-800/80 bg-emerald-950/80 text-emerald-400"
                  : rawStatus === "past_due"
                  ? "border-amber-800/80 bg-amber-950/80 text-amber-400"
                  : "border-zinc-700 bg-zinc-800 text-zinc-400";

              return (
                <SettingsCard key={team.id || team.slug}>
                  <SettingsCardBody>
                    <div className="flex items-center gap-3">
                      {/* Team Avatar */}
                      <TeamAvatar
                        name={team.name || team.slug}
                        logo={team.logo}
                        size={28}
                      />

                      <span className="text-sm font-medium text-white">
                        {team.name || team.slug}
                      </span>

                      <div className="flex items-center gap-1.5 ml-1">
                        <span className="rounded-full border border-zinc-700/80 bg-zinc-800/60 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                          {formattedPlan}
                        </span>
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                            statusBadgeClass,
                          )}
                        >
                          {formattedStatus}
                        </span>
                      </div>
                    </div>
                  </SettingsCardBody>
                  <SettingsCardFooter
                    helperText={
                      <span className="text-xs text-zinc-400">
                        Visit {team.name || team.slug}&apos;s billing settings for details.
                      </span>
                    }
                    action={
                      <Link
                        href={`/${team.slug}/~/settings`}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "h-8 rounded-md border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-xs font-medium text-zinc-200 px-4",
                        )}
                      >
                        View Billing Settings
                      </Link>
                    }
                  />
                </SettingsCard>
              );
            })}
          </div>
        ) : (
          <SettingsCard>
            <SettingsCardBody>
              <div className="py-6 text-center text-xs text-zinc-500">
                You do not belong to any teams yet.
              </div>
            </SettingsCardBody>
          </SettingsCard>
        )}
      </div>
    </div>
  );
}
