"use client";

import { Spinner } from "@/components/dashboard/Spinner";
import { LiveRefresh, LiveSliders, LiveX } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { useCancelDeployment } from "@/features/dashboard/hooks/useCancelDeployment";

/** Cancel while it runs; edit or retry once it has stopped. */
export function DeployViewActions({
  deploymentId,
  onEdit,
  onRetry,
  projectId,
  retrying,
  running,
}: {
  deploymentId: string;
  onEdit: () => void;
  onRetry: () => void;
  projectId: string;
  retrying: boolean;
  running: boolean;
}) {
  const { cancel, canceling } = useCancelDeployment(projectId, deploymentId);
  if (running)
    return (
      <Button
        data-icon-trigger
        disabled={canceling}
        onClick={cancel}
        size="sm"
        type="button"
        variant="quiet"
      >
        {canceling ? <Spinner className="size-3" /> : <LiveX strokeWidth={2} />}
        Cancel
      </Button>
    );
  return (
    <>
      <Button
        data-icon-trigger
        disabled={retrying}
        onClick={onEdit}
        size="sm"
        type="button"
        variant="raised"
      >
        <LiveSliders strokeWidth={1.75} />
        Edit settings
      </Button>
      <Button
        data-icon-trigger
        disabled={retrying}
        onClick={onRetry}
        size="sm"
        type="button"
        variant="hero"
      >
        {retrying ? (
          <Spinner className="size-3" />
        ) : (
          <LiveRefresh strokeWidth={2} />
        )}
        Try again
      </Button>
    </>
  );
}
