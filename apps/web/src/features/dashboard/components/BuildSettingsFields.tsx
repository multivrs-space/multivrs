"use client";

import { ChevronRight } from "lucide-react";
import type { DeploymentImportConfig } from "@/features/dashboard/types/deployment-import.types";

export interface BuildDefaults {
  buildCommand: string | null;
  installCommand: string | null;
  outputDirectory: string | null;
}

const FIELDS = [
  ["Build command", "buildCommand"],
  ["Output directory", "outputDirectory"],
  ["Install command", "installCommand"],
] as const;

export function BuildSettingsFields({
  config,
  defaults,
  onChange,
  open,
  onToggle,
}: {
  config: DeploymentImportConfig;
  defaults: BuildDefaults;
  onChange: (config: DeploymentImportConfig) => void;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-(--hairline)">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3.5 py-3 text-[13px] font-medium text-foreground/80 hover:text-foreground"
      >
        <ChevronRight
          className={
            open
              ? "size-3.5 rotate-90 transition-transform"
              : "size-3.5 transition-transform"
          }
        />
        Build and output settings
      </button>
      {open ? (
        <div className="space-y-3 px-3.5 pb-4">
          {FIELDS.map(([label, key]) => (
            <label
              key={key}
              className="block space-y-1.5 text-xs text-muted-foreground"
            >
              <span>{label}</span>
              <input
                value={config[key]}
                placeholder={defaults[key] ?? "None"}
                onChange={(event) =>
                  onChange({ ...config, [key]: event.target.value })
                }
                className="h-9 w-full rounded-md border border-(--hairline) bg-foreground/[0.03] px-3 font-mono text-xs text-foreground outline-hidden placeholder:text-muted-foreground/70 focus:border-ring"
              />
            </label>
          ))}
          <p className="text-[11px] text-muted-foreground">
            Leave a field empty to use the detected default shown.
          </p>
        </div>
      ) : null}
    </section>
  );
}
