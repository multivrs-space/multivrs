"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { SegmentedControl } from "@/components/dashboard/SegmentedControl";
import { LiveKeyRound, LiveTrash } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { DashboardSearchInput } from "@/features/dashboard/components/DashboardSearchInput";
import type {
  DashboardEnvironmentVariable,
  EnvironmentTarget,
} from "@/features/dashboard/types/environment-variable.types";
import { requestOk } from "@/lib/api/request.client";
import { cn } from "@/lib/utils";

const TARGET_CHIP: Record<EnvironmentTarget, string> = {
  production: "bg-primary/12 text-primary",
  preview: "bg-foreground/7 text-foreground/80",
  development: "bg-foreground/5 text-muted-foreground",
};

/** Every variable with the environments it reaches; delete with a confirm. */
export function EnvironmentVariableRows({
  projectId,
  variables,
}: {
  projectId: string;
  variables: DashboardEnvironmentVariable[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState<EnvironmentTarget | "all">("all");
  const [deleting, setDeleting] = useState<DashboardEnvironmentVariable | null>(
    null,
  );
  const [pending, setPending] = useState(false);
  const needle = query.trim().toLowerCase();
  const visible = variables.filter(
    (variable) =>
      (target === "all" || variable.targets.includes(target)) &&
      variable.key.toLowerCase().includes(needle),
  );

  function remove() {
    if (!deleting || pending) return;
    setPending(true);
    void requestOk(
      `/api/projects/${projectId}/environment/${deleting.id}`,
      { method: "DELETE" },
      "Delete failed",
    )
      .then(() => {
        toast.success(`${deleting.key} deleted`);
        setDeleting(null);
        router.refresh();
      })
      .catch(() => toast.error(`Couldn't delete ${deleting.key}.`))
      .finally(() => setPending(false));
  }

  if (!variables.length) {
    return (
      <DashCard>
        <EmptyState
          description="Add API keys, database URLs and other secrets above. They're encrypted at rest."
          glyph={LiveKeyRound}
          title="No variables yet"
        />
      </DashCard>
    );
  }

  return (
    <DashCard aria-label="Project variables">
      <DashCardHeader
        description={`${variables.length} encrypted ${variables.length === 1 ? "value" : "values"}`}
        icon={LiveKeyRound}
        title="Variables"
      />
      <div className="flex flex-wrap gap-2 px-5 pt-4">
        <DashboardSearchInput
          containerClassName="min-w-48 flex-1"
          onValueChange={setQuery}
          placeholder="Find a variable"
          size="sm"
          value={query}
        />
        <SegmentedControl
          aria-label="Environment"
          onChange={setTarget}
          options={[
            { value: "all", label: "All" },
            { value: "production", label: "Production" },
            { value: "preview", label: "Preview" },
            { value: "development", label: "Development" },
          ]}
          value={target}
        />
      </div>
      <div className="divide-y divide-hairline p-2 pt-3">
        {visible.map((variable) => (
          <div
            className="grid items-center gap-3 rounded-tile px-3 py-3 transition-colors hover:bg-foreground/[0.025] md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
            key={variable.id}
          >
            <code className="truncate font-geist-mono text-[12.5px] font-medium text-foreground">
              {variable.key}
            </code>
            <code className="truncate font-geist-mono text-[12px] text-muted-foreground">
              {variable.value}
            </code>
            <span className="flex flex-wrap gap-1">
              {variable.targets.map((item) => (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10.5px] font-medium capitalize",
                    TARGET_CHIP[item],
                  )}
                  key={item}
                >
                  {item}
                </span>
              ))}
            </span>
            <Button
              aria-label={`Delete ${variable.key}`}
              className="size-8"
              data-icon-trigger
              onClick={() => setDeleting(variable)}
              size="icon-sm"
              variant="quiet"
            >
              <LiveTrash strokeWidth={1.75} />
            </Button>
          </div>
        ))}
        {visible.length ? null : (
          <p className="py-10 text-center text-[13px] text-muted-foreground">
            No variables match.
          </p>
        )}
      </div>
      <ConfirmDialog
        busy={pending}
        description="Deployments made after this won't receive it. Running deployments keep their current value."
        onConfirm={remove}
        onOpenChange={(open) => (open ? null : setDeleting(null))}
        open={deleting !== null}
        title={`Delete ${deleting?.key ?? "variable"}?`}
      />
    </DashCard>
  );
}
