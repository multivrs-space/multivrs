import {
  formatCompact,
  formatPercent,
  percentChange,
} from "@/components/dashboard/lib/format";
import {
  type AnimatedIcon,
  LiveActivity,
  LiveAtSign,
  LiveLayoutGrid,
  LiveRocket,
} from "@/components/icons/animated";
import { weekOverWeek } from "@/features/dashboard/lib/overview-insights";
import type { DeployStats } from "@/features/dashboard/types/overview.types";
import type { DashboardProject } from "@/features/dashboard/types/project.types";
import type { AccountUsage } from "@/features/dashboard/types/usage.types";
import { deliveryRate, totalActivity } from "@/features/mail/lib/mail-metrics";
import type { MailActivityDay } from "@/features/mail/mail.types";

export interface Tile {
  title: string;
  icon: AnimatedIcon;
  href: string;
  value: string;
  label: string;
  delta?: number | null;
  footnote?: string;
}

export interface WorkspaceNumbers {
  username: string;
  usage: AccountUsage;
  deploys: DeployStats;
  mail: MailActivityDay[] | null;
  projects: DashboardProject[];
}

/** The four headline tiles, one per layer, each linking to its page. */
export function overviewTiles({
  username,
  usage,
  deploys,
  mail,
  projects,
}: WorkspaceNumbers): Tile[] {
  const traffic = weekOverWeek(usage.series);
  const sent = mail ? totalActivity(mail) : null;
  const delivered = sent ? deliveryRate(sent) : null;
  const live = projects.filter((project) => project.status === "ready").length;
  const failing = projects.filter(
    (project) => project.status === "error",
  ).length;
  const building = projects.filter(
    (project) => project.status === "building",
  ).length;
  const base = `/${username}/~`;
  const tiles: Tile[] = [
    usage.state === "ready"
      ? {
          title: "Requests",
          icon: LiveActivity,
          href: `${base}/projects?view=usage`,
          value: formatCompact(traffic.current + traffic.previous),
          label: "Last 14 days",
          // No pill without a baseline: an empty "— —" reads like an error.
          delta: traffic.change ?? undefined,
          footnote:
            traffic.change !== null
              ? "vs the week before"
              : traffic.current
                ? "No traffic the week before"
                : live
                  ? undefined
                  : "Counts once a project is live",
        }
      : {
          title: "Requests",
          icon: LiveActivity,
          href: `${base}/projects?view=usage`,
          value: "—",
          label:
            usage.state === "error"
              ? "Couldn't load traffic"
              : "Traffic isn't measured yet",
        },
    {
      title: "Deploys",
      icon: LiveRocket,
      href: `${base}/deployments`,
      value: formatCompact(deploys.thisWeek),
      label: "This week",
      delta: percentChange(deploys.thisWeek, deploys.lastWeek) ?? undefined,
      footnote: `${deploys.lastWeek} the week before`,
    },
    sent
      ? {
          title: "Emails sent",
          icon: LiveAtSign,
          href: `${base}/emails?view=analytics`,
          value: formatCompact(sent.sent),
          label: "Last 30 days",
          footnote:
            delivered === null
              ? sent.sent
                ? "No delivery reports yet"
                : "Nothing sent yet"
              : `${formatPercent(delivered, 1)} delivered`,
        }
      : {
          title: "Emails sent",
          icon: LiveAtSign,
          href: `${base}/emails?view=overview`,
          value: "—",
          label: "Mail isn't set up here",
        },
    {
      title: "Projects live",
      icon: LiveLayoutGrid,
      href: `${base}/projects`,
      value: formatCompact(live),
      label: `of ${projects.length} ${projects.length === 1 ? "project" : "projects"}`,
      footnote:
        [failing && `${failing} failed`, building && `${building} building`]
          .filter(Boolean)
          .join(" · ") || undefined,
    },
  ];
  return tiles;
}
