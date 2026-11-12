"use client";

import { use } from "react";
import { DashCard } from "@/components/dashboard/DashCard";
import { UsageBurnCard } from "@/features/dashboard/components/usage/UsageBurnCard";
import { UsageMeterTable } from "@/features/dashboard/components/usage/UsageMeterTable";
import { UsagePlanCard } from "@/features/dashboard/components/usage/UsagePlanCard";
import type { AccountUsage } from "@/features/dashboard/types/usage.types";

/**
 * This billing period: the plan and the days left, the headline meters
 * climbing toward their allowance, then every meter by layer.
 */
export function UsageView({
  usage,
  username,
}: {
  usage: Promise<AccountUsage>;
  username: string;
}) {
  const data = use(usage);
  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-12">
        <UsagePlanCard
          className="lg:col-span-4 lg:min-h-[420px]"
          usage={data}
          username={username}
        />
        <UsageBurnCard className="lg:col-span-8" usage={data} />
      </div>
      {data.state === "ready" ? null : (
        <DashCard className="px-5 py-4 text-[13px] text-muted-foreground">
          {data.state === "error"
            ? "Edge figures couldn't be loaded just now, so requests, transfer and function meters may read low. Platform meters below are current."
            : "Edge measurement isn't connected in this environment, so only platform meters (builds, sandboxes, workflows, mail) are shown."}
        </DashCard>
      )}
      <UsageMeterTable meters={data.meters} />
    </div>
  );
}
