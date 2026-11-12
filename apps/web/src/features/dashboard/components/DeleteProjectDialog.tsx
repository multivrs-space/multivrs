"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { readableError, requestOk } from "@/lib/api/request.client";

/** Confirms, then deletes the project and refreshes the list it sat in. */
export function DeleteProjectDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  function remove() {
    if (deleting) return;
    setDeleting(true);
    void requestOk(
      `/api/projects/${projectId}`,
      { method: "DELETE" },
      "Project deletion failed",
    )
      .then(() => {
        toast.success(`${projectName} deleted`);
        onOpenChange(false);
        router.refresh();
      })
      .catch((error: unknown) =>
        toast.error(readableError(error, "Project deletion failed")),
      )
      .finally(() => setDeleting(false));
  }

  return (
    <ConfirmDialog
      busy={deleting}
      confirmLabel="Delete project"
      description="This permanently removes the project with its deployments, logs and settings. It can't be undone."
      onConfirm={remove}
      onOpenChange={onOpenChange}
      open={open}
      title={`Delete ${projectName}?`}
    />
  );
}
