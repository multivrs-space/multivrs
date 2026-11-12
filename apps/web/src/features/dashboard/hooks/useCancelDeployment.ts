"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { readableError, requestOk } from "@/lib/api/request.client";

/** Stop a queued or running build, then refresh what's on screen. */
export function useCancelDeployment(projectId: string, deploymentId: string) {
  const router = useRouter();
  const [canceling, setCanceling] = useState(false);
  function cancel() {
    if (canceling) return;
    setCanceling(true);
    void requestOk(
      `/api/projects/${projectId}/deployments/${deploymentId}/status`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "canceled" }),
      },
      "Unable to cancel deployment",
    )
      .then(() => {
        toast.success("Deployment canceled");
        router.refresh();
      })
      .catch((error: unknown) =>
        toast.error(readableError(error, "Unable to cancel deployment")),
      )
      .finally(() => setCanceling(false));
  }
  return { cancel, canceling };
}
