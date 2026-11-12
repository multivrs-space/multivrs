"use client";

import type { ClipboardEvent } from "react";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { DASH_FIELD } from "@/components/dashboard/menu";
import { LiveKeyRound, LivePlus, LiveTrash } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseDotenv, VARIABLE_NAME } from "@/features/dashboard/lib/dotenv";
import type {
  DeploymentImportConfig,
  EnvironmentDraft,
} from "@/features/dashboard/types/deployment-import.types";
import { randomId } from "@/lib/browser/random-id";
import { cn } from "@/lib/utils";

const FIELD = cn(DASH_FIELD, "h-10 font-geist-mono text-[12.5px]");

/** Name/value rows that become the project's variables on Deploy. */
export function EnvironmentDraftEditor({
  config,
  onChange,
}: {
  config: DeploymentImportConfig;
  onChange: (config: DeploymentImportConfig) => void;
}) {
  const rows = config.environment;
  const filled = rows.filter((row) => row.key.trim()).length;
  const set = (environment: EnvironmentDraft[]) =>
    onChange({ ...config, environment });
  const update = (id: string, patch: Partial<EnvironmentDraft>) =>
    set(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  // Pasting a whole .env file into a name field fills one row per line.
  function paste(id: string, event: ClipboardEvent<HTMLInputElement>) {
    const pairs = parseDotenv(event.clipboardData.getData("text"));
    if (!pairs || (pairs.length === 1 && !pairs[0]?.value)) return;
    event.preventDefault();
    const added = pairs.map((pair) => ({ id: randomId(), ...pair }));
    set(
      rows.flatMap((row) =>
        row.id !== id ? [row] : row.key || row.value ? [row, ...added] : added,
      ),
    );
  }

  return (
    <DashCard aria-label="Environment variables">
      <DashCardHeader
        description={
          filled
            ? `${filled} to save · encrypted, for every environment`
            : "Saved to the project, encrypted"
        }
        icon={LiveKeyRound}
        title="Environment variables"
      />
      <div className="space-y-2 p-5 pt-4">
        {rows.map((row) => {
          const invalid =
            row.key.trim() !== "" && !VARIABLE_NAME.test(row.key.trim());
          return (
            <div
              className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2"
              key={row.id}
            >
              <Input
                aria-invalid={invalid || undefined}
                aria-label="Name"
                className={cn(
                  FIELD,
                  invalid &&
                    "border-rose-500/60 focus-visible:ring-rose-500/30",
                )}
                onChange={(event) =>
                  update(row.id, { key: event.target.value })
                }
                onPaste={(event) => paste(row.id, event)}
                placeholder="API_URL"
                spellCheck={false}
                value={row.key}
              />
              <Input
                aria-label="Value"
                className={FIELD}
                onChange={(event) =>
                  update(row.id, { value: event.target.value })
                }
                placeholder="value"
                spellCheck={false}
                value={row.value}
              />
              <Button
                aria-label={`Remove ${row.key || "variable"}`}
                className="size-10 rounded-control px-0 hover:text-rose-600 dark:hover:text-rose-400"
                data-icon-trigger
                onClick={() => set(rows.filter((entry) => entry.id !== row.id))}
                type="button"
                variant="quiet"
              >
                <LiveTrash className="size-4" strokeWidth={1.75} />
              </Button>
            </div>
          );
        })}
        {rows.some(
          (row) => row.key.trim() && !VARIABLE_NAME.test(row.key.trim()),
        ) ? (
          <p className="text-xs text-rose-700 dark:text-rose-300">
            Names use letters, numbers and underscores, and can't start with a
            number.
          </p>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <Button
            data-icon-trigger
            onClick={() =>
              set([...rows, { id: randomId(), key: "", value: "" }])
            }
            size="sm"
            type="button"
            variant="raised"
          >
            <LivePlus strokeWidth={2} />
            Add another
          </Button>
          <p className="text-xs text-muted-foreground">
            Tip: paste a whole .env file into a name field.
          </p>
        </div>
      </div>
    </DashCard>
  );
}
