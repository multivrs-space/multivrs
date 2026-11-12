"use client";

import { use } from "react";
import { type OrbTone, StatusOrb } from "@/components/dashboard/StatusOrb";
import { BuildWatcher } from "@/features/dashboard/components/deployments/BuildWatcher";
import type { ProjectFilter } from "@/features/dashboard/components/ProjectsToolbar";
import type { DashboardProject } from "@/features/dashboard/types/project.types";
import { cn } from "@/lib/utils";

interface ProjectsHealthProps {
  projects: Promise<DashboardProject[] | null>;
  className?: string;
  filter: ProjectFilter;
  onFilterChange: (filter: ProjectFilter) => void;
}

const TILES: { filter: ProjectFilter; label: string; tone?: OrbTone }[] = [
  { filter: "all", label: "All projects" },
  { filter: "ready", label: "Ready", tone: "ready" },
  { filter: "building", label: "Building", tone: "building" },
  { filter: "error", label: "Failed", tone: "error" },
];

/**
 * The workspace at a glance, counted from the projects themselves. Each tile
 * is also a filter, with the same words as the status pills: pick "Failed"
 * to see only what needs attention.
 */
export function ProjectsHealth({
  projects,
  className,
  filter,
  onFilterChange,
}: ProjectsHealthProps) {
  const list = use(projects) ?? [];
  const builds = list.flatMap((project) =>
    project.status === "building" && project.latestDeployment
      ? [
          {
            projectId: project.id,
            deploymentId: project.latestDeployment.id,
            status: project.latestDeployment.rawStatus,
          },
        ]
      : [],
  );
  const count = (key: ProjectFilter) =>
    key === "all"
      ? list.length
      : list.filter((project) => project.status === key).length;

  return (
    <div
      className={cn(
        "surface-card grid grid-cols-2 overflow-hidden rounded-card md:grid-cols-4",
        className,
      )}
    >
      <BuildWatcher builds={builds} />
      {TILES.map((tile, index) => {
        const value = count(tile.filter);
        const active = filter === tile.filter;
        return (
          <button
            aria-pressed={active}
            className={cn(
              "group relative flex flex-col items-start gap-3 p-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
              index > 0 && "border-hairline md:border-l",
              index === 2 && "border-t md:border-t-0",
              index === 3 && "border-t border-l md:border-t-0",
              index === 1 && "border-l",
              active ? "bg-foreground/[0.035]" : "hover:bg-foreground/[0.02]",
            )}
            key={tile.filter}
            onClick={() =>
              onFilterChange(
                active && tile.filter !== "all" ? "all" : tile.filter,
              )
            }
            type="button"
          >
            <span className="flex items-center gap-2 text-[12px] text-muted-foreground">
              {tile.tone ? (
                <StatusOrb
                  label={tile.label}
                  tone={value ? tile.tone : "idle"}
                />
              ) : null}
              {tile.label}
            </span>
            <span className="figure text-[30px] font-semibold leading-none text-foreground">
              {value}
            </span>
            {active && tile.filter !== "all" ? (
              <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-primary" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
