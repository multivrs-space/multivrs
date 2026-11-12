import Link from "next/link";
import { type OrbTone, StatusOrb } from "@/components/dashboard/StatusOrb";
import { LiveGitBranch, LiveRocket } from "@/components/icons/animated";
import { GitHubMark } from "@/features/dashboard/components/GitHubMark";
import { ProjectCardActions } from "@/features/dashboard/components/ProjectCardActions";
import { ProjectFavicon } from "@/features/dashboard/components/ProjectFavicon";
import type {
  DashboardProject,
  ProjectStatus,
} from "@/features/dashboard/types/project.types";

const STATUS: Record<ProjectStatus, { tone: OrbTone; label: string }> = {
  idle: { tone: "idle", label: "No deployments" },
  ready: { tone: "ready", label: "Ready" },
  building: { tone: "building", label: "Building" },
  error: { tone: "error", label: "Failed" },
};

interface ProjectCardProps {
  project: DashboardProject;
  href: string;
}

/**
 * One project: its face (favicon, name, live address), its state, the latest
 * deploy and where the code lives. The whole card leads to the project.
 */
export function ProjectCard({ project, href }: ProjectCardProps) {
  const deployment = project.latestDeployment;
  const status = STATUS[project.status];

  return (
    <article
      className="surface-card group relative flex flex-col rounded-card transition-[transform,box-shadow] duration-300 ease-out-expo hover:-translate-y-0.5"
      data-dash-card
    >
      <div className="flex items-start gap-3 p-4 pb-3">
        <span className="surface-inset grid size-11 shrink-0 place-items-center overflow-hidden rounded-tile">
          <ProjectFavicon
            className="size-7 rounded-[7px]"
            name={project.name}
            url={project.faviconUrl}
          />
        </span>
        <div className="min-w-0 flex-1">
          <Link
            className="block w-fit max-w-full truncate text-[15px] font-semibold tracking-[-0.015em] text-foreground outline-none after:absolute after:inset-0 after:rounded-card focus-visible:after:ring-2 focus-visible:after:ring-ring"
            href={href}
          >
            {project.name}
          </Link>
          {project.siteUrl && project.siteLabel ? (
            <a
              className="relative z-10 mt-0.5 block w-fit max-w-full truncate font-geist-mono text-[12px] text-muted-foreground transition-colors hover:text-foreground"
              href={project.siteUrl}
              rel="noreferrer"
              target="_blank"
            >
              {project.siteLabel}
            </a>
          ) : (
            <span className="mt-0.5 block text-[12px] text-muted-foreground">
              Not deployed yet
            </span>
          )}
        </div>
        <div className="relative z-10 flex shrink-0 items-center gap-1">
          <StatusOrb label={status.label} pill tone={status.tone} />
          <ProjectCardActions
            href={href}
            projectId={project.id}
            projectName={project.name}
            repositoryUrl={project.repositoryUrl}
            siteUrl={project.siteUrl}
          />
        </div>
      </div>

      <div className="px-4 pb-4">
        {deployment ? (
          <Link
            className="relative z-10 flex min-w-0 items-center gap-2 rounded-control py-1 text-[13px] text-foreground/90 transition-colors hover:text-foreground"
            data-icon-trigger
            href={`${href}/deployments/${deployment.id}`}
          >
            <LiveRocket
              className="size-3.5 shrink-0 text-muted-foreground"
              strokeWidth={1.75}
            />
            <span className="truncate">{deployment.label}</span>
            <span className="ml-auto flex shrink-0 items-center gap-1 rounded-full bg-foreground/5 px-2 py-0.5 font-geist-mono text-[10.5px] text-muted-foreground">
              <LiveGitBranch className="size-3" strokeWidth={2} />
              {deployment.branch}
            </span>
          </Link>
        ) : (
          <p className="py-1 text-[13px] text-muted-foreground">
            Deploy to get a live address.
          </p>
        )}
      </div>

      <div className="surface-inset mx-2 mb-2 mt-auto flex min-w-0 items-center gap-2 rounded-tile px-3 py-2 text-[12px] text-muted-foreground">
        <GitHubMark className="size-3.5 shrink-0" />
        {project.repositoryUrl && project.repositoryLabel ? (
          <a
            className="relative z-10 truncate transition-colors hover:text-foreground"
            href={project.repositoryUrl}
            rel="noreferrer"
            target="_blank"
          >
            {project.repositoryLabel}
          </a>
        ) : (
          <span className="truncate">No repository connected</span>
        )}
        {deployment ? (
          <time className="ml-auto shrink-0 font-geist-mono text-[10.5px]">
            {deployment.createdAt}
          </time>
        ) : null}
      </div>
    </article>
  );
}
