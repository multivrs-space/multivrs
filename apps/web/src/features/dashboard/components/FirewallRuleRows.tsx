"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import {
  LiveListFilter,
  LiveShieldCheck,
  LiveTrash,
} from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  ACTION_CHIP,
  ACTIONS,
  describeCondition,
} from "@/features/dashboard/lib/firewall-copy";
import type { DashboardFirewallRule } from "@/features/dashboard/types/firewall-rule.types";
import { requestOk } from "@/lib/api/request.client";
import { cn } from "@/lib/utils";

/** The rules in evaluation order, each pausable and removable. */
export function FirewallRuleRows({
  projectId,
  rules,
}: {
  projectId: string;
  rules: DashboardFirewallRule[];
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string>();
  const [deleting, setDeleting] = useState<DashboardFirewallRule | null>(null);

  const mutate = (rule: DashboardFirewallRule, method: "PATCH" | "DELETE") => {
    if (pendingId) return;
    setPendingId(rule.id);
    void requestOk(
      `/api/projects/${projectId}/firewall/${rule.id}`,
      {
        body:
          method === "PATCH"
            ? JSON.stringify({ enabled: !rule.enabled })
            : undefined,
        headers:
          method === "PATCH"
            ? { "content-type": "application/json" }
            : undefined,
        method,
      },
      "Firewall update failed",
    )
      .then(() => {
        if (method === "DELETE") {
          toast.success(`${rule.name} deleted`);
          setDeleting(null);
        }
        router.refresh();
      })
      .catch(() =>
        toast.error(
          `Couldn't ${method === "PATCH" ? "update" : "delete"} ${rule.name}.`,
        ),
      )
      .finally(() => setPendingId(undefined));
  };

  if (!rules.length) {
    return (
      <DashCard>
        <EmptyState
          description="Traffic is allowed by default. Add a rule above to block, challenge or rate-limit."
          glyph={LiveShieldCheck}
          title="No custom rules"
        />
      </DashCard>
    );
  }

  return (
    <DashCard aria-label="Rules">
      <DashCardHeader
        description="Evaluated top to bottom"
        icon={LiveListFilter}
        title="Rules"
      />
      <ol className="divide-y divide-hairline p-2 pt-3">
        {rules.map((rule) => (
          <li
            className={cn(
              "flex flex-wrap items-center gap-3 rounded-tile px-3 py-3 transition-colors hover:bg-foreground/[0.025]",
              !rule.enabled && "opacity-60",
            )}
            key={rule.id}
          >
            <span className="surface-inset grid size-8 shrink-0 place-items-center rounded-full font-geist-mono text-[11px] text-muted-foreground">
              {rule.priority + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-medium">{rule.name}</p>
              <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                If{" "}
                {rule.conditions
                  .map((condition) =>
                    describeCondition(
                      condition.type,
                      condition.op,
                      condition.value,
                    ),
                  )
                  .join(" and ")}
              </p>
            </div>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium",
                ACTION_CHIP[rule.action] ?? "bg-foreground/6",
              )}
            >
              {ACTIONS[rule.action] ?? rule.action}
            </span>
            <Switch
              aria-label={`${rule.enabled ? "Pause" : "Enable"} ${rule.name}`}
              checked={rule.enabled}
              disabled={pendingId === rule.id}
              onCheckedChange={() => mutate(rule, "PATCH")}
            />
            <Button
              aria-label={`Delete ${rule.name}`}
              className="size-8"
              data-icon-trigger
              disabled={pendingId === rule.id}
              onClick={() => setDeleting(rule)}
              size="icon-sm"
              variant="quiet"
            >
              <LiveTrash strokeWidth={1.75} />
            </Button>
          </li>
        ))}
      </ol>
      <ConfirmDialog
        busy={pendingId === deleting?.id}
        description="Traffic it matched will fall through to the next rule."
        onConfirm={() => (deleting ? mutate(deleting, "DELETE") : undefined)}
        onOpenChange={(open) => (open ? null : setDeleting(null))}
        open={deleting !== null}
        title={`Delete ${deleting?.name ?? "rule"}?`}
      />
    </DashCard>
  );
}
