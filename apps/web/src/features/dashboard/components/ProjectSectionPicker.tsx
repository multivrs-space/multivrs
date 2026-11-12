"use client";

import Link from "next/link";
import { useState } from "react";
import { type OrbTone, StatusOrb } from "@/components/dashboard/StatusOrb";
import { LiveArrowUpRight, LiveSparkles } from "@/components/icons/animated";
import { DashboardSearchInput } from "@/features/dashboard/components/DashboardSearchInput";
import { PageBody } from "@/features/dashboard/components/PageBody";
import { ProjectFavicon } from "@/features/dashboard/components/ProjectFavicon";
import { DASHBOARD_NAV_ITEMS } from "@/features/dashboard/constants/navigation";
import { Object3DSlot } from "@/features/dashboard/three/Object3DSlot";
import type {
  DashboardProject,
  ProjectStatus,
} from "@/features/dashboard/types/project.types";

const TONES: Record<ProjectStatus, OrbTone> = {
  idle: "idle",
  ready: "ready",
  building: "building",
  error: "error",
};

function sectionIcon(section: string) {
  return (
    DASHBOARD_NAV_ITEMS.find((item) => item.slug === section)?.icon ??
    LiveSparkles
  );
}

/** Workspace-level entry to a per-project section: pick the project first. */
export function ProjectSectionPicker({
  username,
  section,
  title,
  projects,
}: {
  username: string;
  section: string;
  title: string;
  projects: DashboardProject[];
}) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const matches = needle
    ? projects.filter((project) => project.name.toLowerCase().includes(needle))
    : projects;

  return (
    <PickerShell section={section} title={title}>
      <DashboardSearchInput
        containerClassName="mx-auto max-w-xl"
        onValueChange={setQuery}
        placeholder="Find a project…"
        size="lg"
        value={query}
      />
      {matches.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {matches.map((project) => (
            <Link
              className="surface-card surface-press group flex items-center gap-3 rounded-card p-4 outline-none transition-transform duration-300 ease-out-expo hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring"
              data-icon-trigger
              href={`/${username}/${project.slug}/${section}`}
              key={project.slug}
            >
              <span className="surface-inset grid size-10 shrink-0 place-items-center overflow-hidden rounded-tile">
                <ProjectFavicon
                  className="size-6 rounded-md"
                  name={project.name}
                  url={project.faviconUrl}
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-[14px] font-semibold">
                    {project.name}
                  </span>
                  <StatusOrb
                    label={project.status}
                    tone={TONES[project.status]}
                  />
                </span>
                <span className="mt-0.5 block truncate font-geist-mono text-[11.5px] text-muted-foreground">
                  {project.siteLabel ?? "Not deployed yet"}
                </span>
              </span>
              <LiveArrowUpRight
                className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
                strokeWidth={2}
              />
            </Link>
          ))}
        </div>
      ) : (
        <p className="py-10 text-center text-[13px] text-muted-foreground">
          {projects.length
            ? `No projects match “${query}”.`
            : "Create a project first."}
        </p>
      )}
    </PickerShell>
  );
}

export function ProjectSectionPickerSkeleton({
  section,
  title,
}: {
  section: string;
  title: string;
}) {
  return (
    <PickerShell section={section} title={title}>
      <span className="skeleton mx-auto block h-11 w-full max-w-xl rounded-control" />
      <div
        aria-label="Loading projects"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
        role="status"
      >
        {["one", "two", "three", "four", "five", "six"].map((key) => (
          <div
            aria-hidden="true"
            className="surface-card flex items-center gap-3 rounded-card p-4"
            key={key}
          >
            <span className="skeleton size-10 rounded-tile" />
            <span className="flex-1 space-y-2">
              <span className="skeleton block h-3.5 w-1/2" />
              <span className="skeleton block h-3 w-3/4" />
            </span>
          </div>
        ))}
      </div>
    </PickerShell>
  );
}

function PickerShell({
  children,
  section,
  title,
}: {
  children: React.ReactNode;
  section: string;
  title: string;
}) {
  const Icon = sectionIcon(section);
  return (
    <PageBody>
      <div className="mx-auto flex max-w-xl flex-col items-center pt-4 text-center">
        <Object3DSlot
          className="size-32"
          label={`${title} illustration`}
          parts={Icon.parts}
        >
          <Icon className="size-[42%]" strokeWidth={1.5} />
        </Object3DSlot>
        <p className="mt-3 font-geist-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
          {title}
        </p>
        <h1 className="mt-1.5 text-[26px] font-semibold tracking-[-0.03em]">
          Choose a project
        </h1>
        <p className="mt-1.5 text-[13.5px] text-muted-foreground">
          {title} works per project. Pick one to continue.
        </p>
      </div>
      {children}
    </PageBody>
  );
}
