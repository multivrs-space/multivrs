"use client";

import type { Project } from "@multivrs/client";
import type { FrameworkId } from "@multivrs/config";
import { useState } from "react";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { DASH_FIELD } from "@/components/dashboard/menu";
import { LiveBoxes, LiveGlobe } from "@/components/icons/animated";
import { Input } from "@/components/ui/input";
import { FrameworkField } from "@/features/dashboard/components/new-project/FrameworkField";
import type { DetectionState } from "@/features/dashboard/hooks/useFrameworkDetection";
import type { DeploymentImportConfig } from "@/features/dashboard/types/deployment-import.types";
import { slugify } from "@/lib/services/slug";
import { cn } from "@/lib/utils";

const LABEL = "block text-xs font-medium text-muted-foreground";

/** Name, address, framework and folder: the card the form opens with. */
export function ProjectImportBasics({
  config,
  detection,
  deploymentDomain,
  onChange,
  onFrameworkChange,
  onRootCommit,
  project,
}: {
  config: DeploymentImportConfig;
  detection: DetectionState;
  deploymentDomain: string;
  onChange: (config: DeploymentImportConfig) => void;
  onFrameworkChange: (framework: FrameworkId) => void;
  /** Root directory edits re-run detection only once the field loses focus. */
  onRootCommit: (root: string) => void;
  /** Set once an earlier attempt created the project; its name is fixed then. */
  project: Project | null;
}) {
  const [root, setRoot] = useState(config.rootDirectory);
  const slug = project?.slug ?? slugify(config.projectName);
  return (
    <DashCard aria-label="Project">
      <DashCardHeader
        description="What it's called, where it lives and how it's built"
        icon={LiveBoxes}
        title="Project"
      />
      <div className="grid gap-4 p-5 pt-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <label className={LABEL} htmlFor="project-name">
            Project name
          </label>
          <Input
            className={cn(DASH_FIELD, "h-10")}
            id="project-name"
            disabled={project !== null}
            maxLength={100}
            onChange={(event) =>
              onChange({ ...config, projectName: event.target.value })
            }
            value={project?.name ?? config.projectName}
          />
          <span className="flex min-w-0 items-center gap-1.5 text-[11.5px] text-muted-foreground">
            <LiveGlobe className="size-3 shrink-0" strokeWidth={2} />
            <span className="truncate font-geist-mono">
              https://
              <span className="text-foreground">{slug || "your-project"}</span>.
              {deploymentDomain}
            </span>
            {project ? (
              <span className="shrink-0">· already created</span>
            ) : null}
          </span>
        </div>
        <FrameworkField
          detection={detection}
          onChange={onFrameworkChange}
          value={config.framework}
        />
        <div className="space-y-1.5">
          <label className={LABEL} htmlFor="project-root">
            Root directory
          </label>
          <Input
            className={cn(DASH_FIELD, "h-10 font-geist-mono text-[12.5px]")}
            id="project-root"
            onBlur={() => {
              const next = root.trim() || ".";
              setRoot(next);
              if (next !== config.rootDirectory) {
                onChange({ ...config, rootDirectory: next });
                onRootCommit(next);
              }
            }}
            onChange={(event) => setRoot(event.target.value)}
            spellCheck={false}
            value={root}
          />
          <span className="block text-[11.5px] text-muted-foreground">
            The folder with the app, for monorepos. Leave "." for the top.
          </span>
        </div>
      </div>
    </DashCard>
  );
}
