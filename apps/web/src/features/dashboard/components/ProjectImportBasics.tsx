"use client";

import type { FrameworkId } from "@multivrs/config";
import { useState } from "react";
import { FrameworkField } from "@/features/dashboard/components/FrameworkField";
import type { DetectionState } from "@/features/dashboard/hooks/useFrameworkDetection";
import type { DeploymentImportConfig } from "@/features/dashboard/types/deployment-import.types";
import { slugify } from "@/lib/services/slug";

const INPUT_CLASS =
  "h-9 w-full rounded-md border border-(--hairline) bg-foreground/[0.03] px-3 text-[13px] text-foreground outline-hidden focus:border-ring";

export function ProjectImportBasics({
  config,
  detection,
  deploymentDomain,
  onChange,
  onFrameworkChange,
  onRootCommit,
}: {
  config: DeploymentImportConfig;
  detection: DetectionState;
  deploymentDomain: string;
  onChange: (config: DeploymentImportConfig) => void;
  onFrameworkChange: (framework: FrameworkId) => void;
  /** Root directory edits re-run detection only once the field loses focus. */
  onRootCommit: (root: string) => void;
}) {
  const [root, setRoot] = useState(config.rootDirectory);
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="space-y-1.5 text-xs text-muted-foreground sm:col-span-2">
        <span>Project name</span>
        <input
          value={config.projectName}
          onChange={(event) =>
            onChange({ ...config, projectName: event.target.value })
          }
          className={INPUT_CLASS}
        />
        <span className="block font-mono text-[11px]">
          https://
          <span className="text-foreground">{slugify(config.projectName)}</span>
          .{deploymentDomain}
        </span>
      </label>
      <FrameworkField
        detection={detection}
        value={config.framework}
        onChange={onFrameworkChange}
      />
      <label className="space-y-1.5 text-xs text-muted-foreground">
        <span>Root directory</span>
        <input
          value={root}
          onChange={(event) => setRoot(event.target.value)}
          onBlur={() => {
            const next = root.trim() || ".";
            setRoot(next);
            if (next !== config.rootDirectory) {
              onChange({ ...config, rootDirectory: next });
              onRootCommit(next);
            }
          }}
          className={`${INPUT_CLASS} font-mono`}
        />
        <span className="block text-[11px]">
          Folder that contains the app, for monorepos.
        </span>
      </label>
    </div>
  );
}
