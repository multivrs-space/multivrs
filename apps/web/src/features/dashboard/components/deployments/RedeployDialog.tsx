"use client";

import { deploymentSchema } from "@multivrs/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { responseError } from "@/components/ConfirmDialog";
import { DASH_DIALOG } from "@/components/dashboard/menu";
import { LiveRocket } from "@/components/icons/animated";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { warmBuildMachine } from "@/features/dashboard/lib/build-warmup.client";
import { readableError } from "@/lib/api/request.client";

export interface RedeployTarget {
  projectId: string;
  deploymentId: string;
  branch: string;
  target: "production" | "preview";
  /** Where deployments of this scope live, e.g. /acme/~/deployments. */
  deploymentsHref: string;
}

/** Confirm, then build the same branch again and follow the new deployment. */
export function RedeployDialog({
  open,
  onOpenChange,
  source,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: RedeployTarget;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  // Opening the dialog starts the machine, so the redeploy skips the boot.
  useEffect(() => {
    if (open) warmBuildMachine({ projectId: source.projectId });
  }, [open, source.projectId]);

  async function redeploy() {
    setBusy(true);
    try {
      const response = await fetch(
        `/api/projects/${source.projectId}/deployments/${source.deploymentId}/redeploy`,
        { method: "POST" },
      );
      if (!response.ok) {
        throw new Error(
          await responseError(response, "The redeploy didn't start"),
        );
      }
      const next = deploymentSchema.parse(await response.json());
      toast.success(`Redeploying ${source.branch}`);
      onOpenChange(false);
      router.push(`${source.deploymentsHref}/${next.id}`);
    } catch (error) {
      toast.error(readableError(error, "The redeploy didn't start"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent className={DASH_DIALOG}>
        <AlertDialogHeader className="gap-3">
          <span
            className="grid size-10 place-items-center rounded-tile border border-primary/25 bg-primary/10 text-primary"
            data-icon-trigger
          >
            <LiveRocket className="size-5" strokeWidth={1.75} />
          </span>
          <AlertDialogTitle className="text-lg font-semibold tracking-[-0.02em]">
            Redeploy {source.branch}?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[13px] text-muted-foreground">
            Builds the latest commit on {source.branch} again and deploys it to{" "}
            {source.target}. Framework and build steps are detected afresh.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel disabled={busy} size="sm" variant="quiet">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={busy}
            onClick={(event) => {
              event.preventDefault();
              void redeploy();
            }}
            size="sm"
            variant="hero"
          >
            {busy ? "Starting…" : "Redeploy"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
