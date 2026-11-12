"use client";

import { useState } from "react";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { DASH_FIELD } from "@/components/dashboard/menu";
import { LiveSquareTerminal } from "@/components/icons/animated";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { DeploymentImportConfig } from "@/features/dashboard/types/deployment-import.types";
import { cn } from "@/lib/utils";

export interface BuildDefaults {
  buildCommand: string | null;
  installCommand: string | null;
  outputDirectory: string | null;
}

type BuildKey = keyof BuildDefaults;

const FIELDS: { key: BuildKey; label: string; unknown: string }[] = [
  {
    key: "installCommand",
    label: "Install command",
    unknown: "Picked from the lockfile",
  },
  {
    key: "buildCommand",
    label: "Build command",
    unknown: "Nothing to build",
  },
  {
    key: "outputDirectory",
    label: "Output directory",
    unknown: "Found after the build",
  },
];

/**
 * The detected commands, read-only until you switch a row to Override. An
 * overridden row that is left empty falls back to the detected value.
 */
export function BuildSettingsFields({
  config,
  defaults,
  detected,
  onChange,
}: {
  config: DeploymentImportConfig;
  defaults: BuildDefaults;
  /** False while the repository is unread; blanks then mean "not known yet". */
  detected: boolean;
  onChange: (config: DeploymentImportConfig) => void;
}) {
  const [overridden, setOverridden] = useState<ReadonlySet<BuildKey>>(
    () => new Set(FIELDS.filter((f) => config[f.key]).map((f) => f.key)),
  );

  function toggle(key: BuildKey, on: boolean) {
    const next = new Set(overridden);
    if (on) next.add(key);
    else next.delete(key);
    setOverridden(next);
    if (!on) onChange({ ...config, [key]: "" });
  }

  return (
    <DashCard aria-label="Build and output">
      <DashCardHeader
        description="Detected from the repository. Override any of them."
        icon={LiveSquareTerminal}
        title="Build and output"
      />
      <ul className="divide-y divide-hairline px-5 pt-2 pb-3">
        {FIELDS.map((field) => {
          const on = overridden.has(field.key);
          const id = `build-${field.key}`;
          return (
            <li className="py-3" key={field.key}>
              <div className="flex items-center justify-between gap-3">
                <label
                  className="text-[13px] font-medium text-foreground"
                  htmlFor={id}
                >
                  {field.label}
                </label>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  Override
                  <Switch
                    aria-label={`Override ${field.label.toLowerCase()}`}
                    checked={on}
                    onCheckedChange={(next) => toggle(field.key, next)}
                    size="sm"
                  />
                </span>
              </div>
              <Input
                className={cn(
                  DASH_FIELD,
                  "mt-2 font-geist-mono text-[12.5px]",
                  !on &&
                    "border-dashed bg-transparent text-foreground/75 shadow-none disabled:cursor-default disabled:opacity-100",
                )}
                disabled={!on}
                id={id}
                onChange={(event) =>
                  onChange({ ...config, [field.key]: event.target.value })
                }
                placeholder={
                  defaults[field.key] ??
                  (detected ? field.unknown : "Decided during the build")
                }
                spellCheck={false}
                value={on ? config[field.key] : (defaults[field.key] ?? "")}
              />
            </li>
          );
        })}
      </ul>
    </DashCard>
  );
}
