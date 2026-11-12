import Link from "next/link";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { StatusOrb } from "@/components/dashboard/StatusOrb";
import { LiveBoxes, LiveChevronRight } from "@/components/icons/animated";
import {
  overviewDomains,
  overviewMail,
  overviewProjects,
  overviewUsage,
} from "@/features/dashboard/components/overview/overview-data";
import { stackLayers } from "@/features/dashboard/lib/overview-layers";
import type { DashboardProject } from "@/features/dashboard/types/project.types";
import type { AccountUsage } from "@/features/dashboard/types/usage.types";
import type { MailActivityDay } from "@/features/mail/mail.types";

/** Every layer of the stack on one board: what's running and what needs you. */
export async function OverviewStackCard({
  username: workspace,
  className,
}: {
  /** The workspace slug from the route's params, awaited inside this card's Suspense. */
  username: Promise<string>;
  className?: string;
}) {
  const username = await workspace;
  const [projects, domains, mail, usage] = await Promise.all([
    overviewProjects(username),
    overviewDomains(username),
    overviewMail(username),
    overviewUsage(username),
  ]);
  return (
    <OverviewStackView
      className={className}
      domains={domains}
      mail={mail}
      projects={projects}
      usage={usage}
      username={username}
    />
  );
}

interface StackViewProps {
  username: string;
  projects: DashboardProject[];
  domains: { status: string }[];
  mail: MailActivityDay[] | null;
  usage: AccountUsage;
  className?: string;
}

export function OverviewStackView({
  username,
  projects,
  domains,
  mail,
  usage,
  className,
}: StackViewProps) {
  const layers = stackLayers({ username, projects, domains, mail, usage });
  return (
    <DashCard aria-label="Your stack" className={className}>
      <DashCardHeader
        description="Each layer, live"
        icon={LiveBoxes}
        title="Your stack"
      />
      <ul className="space-y-1.5 p-3 pt-4">
        {layers.map(({ icon: Icon, ...layer }) => (
          <li key={layer.name}>
            <Link
              className="group flex items-center gap-3 rounded-tile px-2.5 py-2.5 outline-none transition-colors hover:bg-foreground/[0.03] focus-visible:ring-2 focus-visible:ring-ring"
              data-icon-trigger
              href={layer.href}
            >
              <span className="surface-inset grid size-9 shrink-0 place-items-center rounded-tile text-muted-foreground">
                <Icon className="size-4" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-medium text-foreground">
                  {layer.name}
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                  <StatusOrb label={layer.state} tone={layer.tone} />
                  {layer.state}
                </span>
              </span>
              <span className="font-geist-mono text-[12px] text-muted-foreground">
                {layer.detail}
              </span>
              <LiveChevronRight
                className="size-3.5 text-muted-foreground/60 transition-colors group-hover:text-foreground"
                strokeWidth={2}
              />
            </Link>
          </li>
        ))}
      </ul>
    </DashCard>
  );
}
