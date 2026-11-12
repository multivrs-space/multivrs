import { connection } from "next/server";
import { OverviewDeployHealthView } from "@/features/dashboard/components/overview/OverviewDeployHealthCard";
import { OverviewHeatView } from "@/features/dashboard/components/overview/OverviewHeatCard";
import { OverviewInsightView } from "@/features/dashboard/components/overview/OverviewInsightCard";
import { OverviewKpisView } from "@/features/dashboard/components/overview/OverviewKpis";
import { OverviewRecentDeploysView } from "@/features/dashboard/components/overview/OverviewRecentDeploys";
import { OverviewStackView } from "@/features/dashboard/components/overview/OverviewStackCard";
import { OverviewTrafficView } from "@/features/dashboard/components/overview/OverviewTrafficCard";
import { OVERVIEW_SLOTS as S } from "@/features/dashboard/components/overview/overview-layout";
import { LAB_ACTIVITY } from "@/features/dashboard/lab/lab-mail-data";
import {
  LAB_DEPLOYMENTS,
  LAB_DEPLOYS,
  LAB_DOMAINS,
  LAB_HEAT,
  LAB_PROJECTS,
  LAB_USAGE,
} from "@/features/dashboard/lab/lab-overview-data";

const USER = "acme";

/** The workspace overview's cards, fed with lab data so they can be tuned signed out. */
export async function LabOverviewSamples() {
  // The cards read the clock, so render at request time like the real page.
  await connection();
  return (
    <div className="space-y-3">
      <OverviewKpisView
        deploys={LAB_DEPLOYS}
        mail={LAB_ACTIVITY}
        projects={LAB_PROJECTS}
        usage={LAB_USAGE}
        username={USER}
      />
      <div className="grid gap-3 lg:grid-cols-12">
        <OverviewTrafficView
          projects={LAB_PROJECTS}
          className={S.traffic}
          usage={LAB_USAGE}
          username={USER}
        />
        <OverviewInsightView
          username={USER}
          className={S.insight}
          deploys={LAB_DEPLOYS}
          heat={LAB_HEAT}
          projects={LAB_PROJECTS}
          usage={LAB_USAGE}
        />
        <OverviewHeatView className={S.heat} heat={LAB_HEAT} />
        <OverviewDeployHealthView
          className={S.deploys}
          stats={LAB_DEPLOYS}
          username={USER}
        />
        <OverviewRecentDeploysView
          className={S.recent}
          deployments={LAB_DEPLOYMENTS}
          username={USER}
        />
        <OverviewStackView
          className={S.stack}
          domains={LAB_DOMAINS}
          mail={LAB_ACTIVITY}
          projects={LAB_PROJECTS}
          usage={LAB_USAGE}
          username={USER}
        />
      </div>
    </div>
  );
}
