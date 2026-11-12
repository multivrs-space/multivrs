"use client";

import type { Project } from "@multivrs/client";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CopyButton } from "@/components/CopyButton";
import { DASH_FIELD } from "@/components/dashboard/menu";
import { LiveKeyRound, LiveTrash } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { PageBody } from "@/features/dashboard/components/PageBody";
import { ProjectGeneralCard } from "@/features/dashboard/components/project/ProjectGeneralCard";
import { useProjectSettings } from "@/features/dashboard/components/project/useProjectSettings";
import {
  SettingsCard,
  SettingsCardBody,
  SettingsCardFooter,
} from "@/features/dashboard/components/settings/SettingsCard";
import { cn } from "@/lib/utils";

/** A project's name, framework and repository, its ID, and deletion. */
export function ProjectSettingsPage({
  project,
  username,
}: {
  project: Project;
  username: string;
}) {
  const {
    name,
    framework,
    repositoryUrl,
    changed,
    busy,
    setDraft,
    save,
    remove,
  } = useProjectSettings(project, username);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <PageBody className="max-w-4xl">
      <DashboardPageHeader
        description={`How ${project.name} is named and built.`}
        eyebrow={`${project.name} · Settings`}
        title="Project settings"
      />
      <ProjectGeneralCard
        busy={busy}
        changed={changed}
        framework={framework}
        name={name}
        onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
        onSave={save}
        repositoryUrl={repositoryUrl}
      />
      <SettingsCard id="project-id">
        <SettingsCardBody
          description="Use it when calling the Multivrs API or CLI for this project."
          icon={LiveKeyRound}
          title="Project ID"
        >
          <div className="flex max-w-xl items-center gap-1">
            <input
              aria-label="Project ID"
              className={cn(
                DASH_FIELD,
                "w-full border px-3 font-geist-mono text-[12px] text-muted-foreground",
              )}
              readOnly
              value={project.id}
            />
            <CopyButton className="size-9" text={project.id} />
          </div>
        </SettingsCardBody>
      </SettingsCard>
      <SettingsCard danger id="delete-project">
        <SettingsCardBody
          description="Removes the project with its deployments and domains. This can't be undone."
          icon={LiveTrash}
          title="Delete project"
        />
        <SettingsCardFooter
          action={
            <Button
              data-icon-trigger
              disabled={busy !== null}
              onClick={() => setConfirmDelete(true)}
              size="sm"
              variant="danger"
            >
              {busy === "delete" ? "Deleting…" : "Delete project"}
            </Button>
          }
          danger
          helperText="Everything goes with it, including production."
        />
      </SettingsCard>
      <ConfirmDialog
        busy={busy === "delete"}
        description="This permanently removes the project and all of its deployments. This can't be undone."
        onConfirm={remove}
        onOpenChange={setConfirmDelete}
        open={confirmDelete}
        title={`Delete ${project.name}?`}
      />
    </PageBody>
  );
}
