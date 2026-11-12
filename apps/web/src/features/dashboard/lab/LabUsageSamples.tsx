"use client";

import { useState } from "react";
import { ProjectsHealth } from "@/features/dashboard/components/ProjectsHealth";
import type { ProjectFilter } from "@/features/dashboard/components/ProjectsToolbar";
import { UsageView } from "@/features/dashboard/components/UsageView";
import { ProjectsUsageSummary } from "@/features/dashboard/components/usage/ProjectsUsageSummary";
import {
  LAB_PROJECTS,
  LAB_USAGE,
} from "@/features/dashboard/lab/lab-overview-data";

const USAGE = Promise.resolve(LAB_USAGE);
const PROJECTS = Promise.resolve(LAB_PROJECTS);

/** The Projects page's health + usage row and the usage view, on lab data. */
export function LabUsageSamples() {
  const [filter, setFilter] = useState<ProjectFilter>("all");
  return (
    <div className="space-y-6">
      <div className="grid gap-3 xl:grid-cols-12">
        <ProjectsHealth
          className="xl:col-span-7"
          filter={filter}
          onFilterChange={setFilter}
          projects={PROJECTS}
        />
        <ProjectsUsageSummary
          className="xl:col-span-5"
          onOpen={() => undefined}
          usage={USAGE}
        />
      </div>
      <UsageView usage={USAGE} username="acme" />
    </div>
  );
}
