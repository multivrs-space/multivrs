"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense, useState } from "react";
import { SegmentedControl } from "@/components/dashboard/SegmentedControl";
import {
  LiveChartColumn,
  LiveLayoutGrid,
  LivePlus,
} from "@/components/icons/animated";
import { buttonVariants } from "@/components/ui/button-variants";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { ProjectCardsList } from "@/features/dashboard/components/ProjectCardsList";
import { ProjectsHealth } from "@/features/dashboard/components/ProjectsHealth";
import {
  type ProjectFilter,
  type ProjectLayout,
  type ProjectSort,
  ProjectsToolbar,
  type ProjectView,
} from "@/features/dashboard/components/ProjectsToolbar";
import {
  ProjectCardsSkeleton,
  ProjectsHealthSkeleton,
  ProjectsUsageSkeleton,
  ProjectsUsageSummarySkeleton,
} from "@/features/dashboard/components/skeletons/ProjectCardsSkeleton";
import { ProjectsUsageSummary } from "@/features/dashboard/components/usage/ProjectsUsageSummary";
import { useDashboardScope } from "@/features/dashboard/lib/useDashboardScope";
import type { DashboardProject } from "@/features/dashboard/types/project.types";
import type { AccountUsage } from "@/features/dashboard/types/usage.types";

const UsageView = dynamic(() =>
  import("@/features/dashboard/components/UsageView").then(
    (module) => module.UsageView,
  ),
);

interface ProjectsGridProps {
  /** `usage` when linked from the overview's request tile. */
  initialView?: ProjectView;
  projects: Promise<DashboardProject[] | null>;
  username: Promise<string>;
  usage: Promise<AccountUsage>;
}

/** The workspace's projects with their health, or the workspace's usage. */
export function ProjectsGrid({
  username,
  projects,
  usage,
  initialView = "projects",
}: ProjectsGridProps) {
  const { username: slug } = useDashboardScope();
  const [layout, setLayout] = useState<ProjectLayout>("grid");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ProjectFilter>("all");
  const [sort, setSort] = useState<ProjectSort>("activity");
  const [view, setView] = useState<ProjectView>(initialView);

  return (
    <div className="flex flex-1 flex-col gap-5">
      <DashboardPageHeader
        actions={
          <>
            <SegmentedControl
              aria-label="View"
              onChange={setView}
              options={[
                { value: "projects", label: "Projects", icon: LiveLayoutGrid },
                { value: "usage", label: "Usage", icon: LiveChartColumn },
              ]}
              value={view}
            />
            <Link
              className={buttonVariants({ size: "sm", variant: "hero" })}
              data-icon-trigger
              href={`/${slug}/new`}
            >
              <LivePlus strokeWidth={2} />
              New project
            </Link>
          </>
        }
        description={
          view === "projects"
            ? "Every app in this workspace with its live address and latest deploy."
            : "What this workspace used this billing period, against its plan."
        }
        eyebrow={`${slug} · Workspace`}
        title={view === "projects" ? "Projects" : "Usage"}
      />

      {view === "usage" ? (
        <Suspense fallback={<ProjectsUsageSkeleton />}>
          <UsageView usage={usage} username={slug} />
        </Suspense>
      ) : (
        <>
          <div className="grid gap-3 xl:grid-cols-12">
            <Suspense
              fallback={<ProjectsHealthSkeleton className="xl:col-span-7" />}
            >
              <ProjectsHealth
                className="xl:col-span-7"
                filter={filter}
                onFilterChange={setFilter}
                projects={projects}
              />
            </Suspense>
            <Suspense
              fallback={
                <ProjectsUsageSummarySkeleton className="xl:col-span-5" />
              }
            >
              <ProjectsUsageSummary
                className="xl:col-span-5"
                onOpen={() => setView("usage")}
                usage={usage}
              />
            </Suspense>
          </div>
          <ProjectsToolbar
            filter={filter}
            layout={layout}
            onFilterChange={setFilter}
            onLayoutChange={setLayout}
            onQueryChange={setQuery}
            onSortChange={setSort}
            query={query}
            sort={sort}
          />
          <Suspense fallback={<ProjectCardsSkeleton layout={layout} />}>
            <ProjectCardsList
              filter={filter}
              layout={layout}
              projects={projects}
              query={query}
              sort={sort}
              username={username}
            />
          </Suspense>
        </>
      )}
    </div>
  );
}
