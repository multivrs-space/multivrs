"use client";

import { useState } from "react";
import { LiveRefresh } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import {
  RedeployDialog,
  type RedeployTarget,
} from "@/features/dashboard/components/deployments/RedeployDialog";

/** The deployment page's Redeploy action. */
export function RedeployButton({ source }: { source: RedeployTarget }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        data-icon-trigger
        onClick={() => setOpen(true)}
        size="sm"
        variant="raised"
      >
        <LiveRefresh strokeWidth={1.75} />
        Redeploy
      </Button>
      <RedeployDialog onOpenChange={setOpen} open={open} source={source} />
    </>
  );
}
