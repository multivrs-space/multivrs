"use client";

import { useState } from "react";
import { BillingManager } from "@/features/dashboard/components/BillingManager";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { PageBody } from "@/features/dashboard/components/PageBody";
import { TeamManager } from "@/features/dashboard/components/TeamManager";
import { TeamGeneralSettings } from "@/features/dashboard/components/team/TeamGeneralSettings";
import type { BillingOverview } from "@/features/dashboard/types/billing.types";
import type { AccountTeam } from "@/lib/services/account-team.service";

const SECTION_LABEL =
  "mb-3 scroll-mt-20 font-geist-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground";

/** Team settings as stacked cards: general, members, then billing. */
export function TeamSettingsPage({
  initialTeam,
  billing,
  username,
}: {
  initialTeam: AccountTeam;
  billing: BillingOverview;
  username: string;
}) {
  const [team, setTeam] = useState(initialTeam);
  return (
    <PageBody className="max-w-4xl">
      <DashboardPageHeader
        description="Who's on the team, how it appears, and how it pays."
        eyebrow={`${team.name} · Settings`}
        title="Team settings"
      />
      <section aria-labelledby="general">
        <h2 className={SECTION_LABEL} id="general">
          General
        </h2>
        <TeamGeneralSettings onTeam={setTeam} team={team} username={username} />
      </section>
      <section aria-labelledby="members" className="pt-4">
        <h2 className={SECTION_LABEL} id="members">
          Members
        </h2>
        <TeamManager />
      </section>
      <section aria-labelledby="billing-heading" className="pt-4">
        <h2 className={SECTION_LABEL} id="billing-heading">
          Billing
        </h2>
        <BillingManager initial={billing} />
      </section>
    </PageBody>
  );
}
