import { CardAction } from "@/components/dashboard/CardAction";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { Metric } from "@/components/dashboard/Metric";
import {
  overviewMail,
  overviewProjects,
  overviewUsage,
  overviewViewer,
} from "@/features/dashboard/components/overview/overview-data";
import { OVERVIEW_HEIGHTS } from "@/features/dashboard/components/overview/overview-layout";
import { overviewTiles } from "@/features/dashboard/lib/overview-tiles";
import type { DeployStats } from "@/features/dashboard/types/overview.types";
import type { DashboardProject } from "@/features/dashboard/types/project.types";
import type { AccountUsage } from "@/features/dashboard/types/usage.types";
import type { MailActivityDay } from "@/features/mail/mail.types";
import { workspaceDeployStats } from "@/lib/services/workspace-overview.service";

/** Four headline numbers, one per layer, each a door to its page. */
export async function OverviewKpis({
  username: workspace,
}: {
  username: Promise<string>;
}) {
  const username = await workspace;
  const { userId } = await overviewViewer(username);
  const [usage, deploys, mail, projects] = await Promise.all([
    overviewUsage(username),
    workspaceDeployStats(userId, username),
    overviewMail(username),
    overviewProjects(username),
  ]);
  return (
    <OverviewKpisView
      deploys={deploys}
      mail={mail}
      projects={projects}
      usage={usage}
      username={username}
    />
  );
}

interface KpisViewProps {
  username: string;
  usage: AccountUsage;
  deploys: DeployStats;
  mail: MailActivityDay[] | null;
  projects: DashboardProject[];
}

export function OverviewKpisView({
  username,
  usage,
  deploys,
  mail,
  projects,
}: KpisViewProps) {
  const tiles = overviewTiles({ username, usage, deploys, mail, projects });
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {tiles.map((tile) => (
        <DashCard
          aria-label={tile.title}
          className={OVERVIEW_HEIGHTS.kpi}
          key={tile.title}
        >
          <DashCardHeader
            action={
              <CardAction
                href={tile.href}
                label={`Open ${tile.title.toLowerCase()}`}
              />
            }
            icon={tile.icon}
            title={tile.title}
          />
          <Metric
            className="p-5 pt-5"
            delta={tile.delta}
            footnote={tile.footnote}
            label={tile.label}
            size="md"
            value={tile.value}
          />
        </DashCard>
      ))}
    </div>
  );
}
