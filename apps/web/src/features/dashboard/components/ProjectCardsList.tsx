"use client";

import Link from "next/link";
import { use } from "react";
import { DashCard } from "@/components/dashboard/DashCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LivePlus, LiveRocket, LiveSearch } from "@/components/icons/animated";
import { buttonVariants } from "@/components/ui/button-variants";
import { ProjectCard } from "@/features/dashboard/components/ProjectCard";
import type {
  ProjectFilter,
  ProjectLayout,
  ProjectSort,
} from "@/features/dashboard/components/ProjectsToolbar";
import { buildNavHref } from "@/features/dashboard/constants/navigation";
import type { DashboardProject } from "@/features/dashboard/types/project.types";

interface ProjectCardsListProps {
  layout: ProjectLayout;
  filter: ProjectFilter;
  projects: Promise<DashboardProject[] | null>;
  query: string;
  sort: ProjectSort;
  username: Promise<string>;
}

export function ProjectCardsList({
  layout,
  filter,
  projects: projectsPromise,
  query,
  sort,
  username: usernamePromise,
}: ProjectCardsListProps) {
  const projects = use(projectsPromise) ?? [];
  const username = use(usernamePromise);
  const normalized = query.trim().toLowerCase();
  const filtered = projects
    .filter(
      (project) =>
        (filter === "all" || project.status === filter) &&
        (!normalized ||
          project.name.toLowerCase().includes(normalized) ||
          project.siteLabel?.toLowerCase().includes(normalized) ||
          project.repositoryLabel?.toLowerCase().includes(normalized)),
    )
    .slice()
    .sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : 0));

  if (!projects.length) return <EmptyProjects username={username} />;
  if (!filtered.length) return <NoMatchingProjects />;

  return (
    <div
      className={
        layout === "grid"
          ? "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
          : "grid grid-cols-1 gap-3"
      }
    >
      {filtered.map((project) => (
        <ProjectCard
          key={project.slug}
          project={project}
          href={buildNavHref(username, project.slug, "")}
        />
      ))}
    </div>
  );
}

function EmptyProjects({ username }: { username: string }) {
  return (
    <DashCard>
      <EmptyState
        actions={
          <Link
            className={buttonVariants({ size: "sm", variant: "hero" })}
            data-icon-trigger
            href={`/${username}/new`}
          >
            <LivePlus strokeWidth={2} />
            Create project
          </Link>
        }
        className="min-h-[420px]"
        description="Import a repository, confirm its framework, and ship your first deployment in a couple of minutes."
        glyph={LiveRocket}
        title="Launch your first project"
      />
    </DashCard>
  );
}

function NoMatchingProjects() {
  return (
    <div
      className="flex min-h-64 flex-col items-center justify-center gap-2 rounded-card border border-dashed border-hairline-strong text-center"
      data-icon-trigger
    >
      <span className="surface-inset grid size-10 place-items-center rounded-tile text-muted-foreground">
        <LiveSearch className="size-4" strokeWidth={1.75} />
      </span>
      <h2 className="text-[15px] font-semibold">No matching projects</h2>
      <p className="text-[13px] text-muted-foreground">
        Try a different search or filter.
      </p>
    </div>
  );
}
