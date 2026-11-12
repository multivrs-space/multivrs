"use client";

import type { Project } from "@multivrs/client";
import { projectSchema } from "@multivrs/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { readableError, requestOk } from "@/lib/api/request.client";

/** Draft edits to a project, saving them, and deleting the project. */
export function useProjectSettings(project: Project, username: string) {
  const router = useRouter();
  const [draft, setDraft] = useState<{
    name?: string;
    framework?: string;
    repositoryUrl?: string;
  }>({});
  const [busy, setBusy] = useState<"delete" | "save" | null>(null);
  const name = draft.name ?? project.name;
  const framework = draft.framework ?? project.framework ?? "auto";
  const repositoryUrl = draft.repositoryUrl ?? project.repositoryUrl ?? "";
  const changed = Object.keys(draft).length > 0;

  function save() {
    if (busy) return;
    setBusy("save");
    void requestOk(
      `/api/projects/${project.id}`,
      {
        body: JSON.stringify({
          framework: framework === "auto" ? null : framework,
          name,
          repositoryUrl: repositoryUrl.trim() || null,
        }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      },
      "Project update failed",
    )
      .then((response) => response.json())
      .then((body) => projectSchema.parse(body))
      .then(() => {
        setDraft({});
        toast.success("Project settings saved");
        router.refresh();
      })
      .catch((error: unknown) =>
        toast.error(readableError(error, "Project update failed")),
      )
      .finally(() => setBusy(null));
  }

  function remove() {
    if (busy) return;
    setBusy("delete");
    void requestOk(
      `/api/projects/${project.id}`,
      { method: "DELETE" },
      "Project deletion failed",
    )
      .then(() => {
        toast.success("Project deleted");
        router.replace(`/${username}/~/projects`);
        router.refresh();
      })
      .catch((error: unknown) => {
        toast.error(readableError(error, "Project deletion failed"));
        setBusy(null);
      });
  }

  return {
    name,
    framework,
    repositoryUrl,
    changed,
    busy,
    setDraft,
    save,
    remove,
  };
}
