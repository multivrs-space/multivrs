"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DASH_FIELD } from "@/components/dashboard/menu";
import { Button } from "@/components/ui/button";
import { billingRequest } from "@/features/dashboard/lib/billing-api";
import type { BillingScopeSummary } from "@/features/dashboard/types/billing.types";
import { randomId } from "@/lib/browser/random-id";
import type { AddOnKey } from "@/lib/payments/billing.types";
import { billingUpdatedSchema } from "@/lib/schemas/billing.schemas";
import { cn } from "@/lib/utils";

export type BillingAddOnProduct = {
  key: AddOnKey;
  label: string;
  note: string;
};

/** One paid add-on: how many (or which projects), saved on its own. */
export function BillingAddOnRow({
  product,
  scope,
  onSaved,
}: {
  product: BillingAddOnProduct;
  scope: BillingScopeSummary;
  onSaved: () => Promise<void>;
}) {
  const current = scope.addOns.find((item) => item.key === product.key);
  const [quantity, setQuantity] = useState(current?.quantity ?? 0);
  const [projectIds, setProjectIds] = useState(current?.projectIds ?? []);
  const [loading, setLoading] = useState(false);
  const perProject = product.key === "speed_insights";
  const changed = perProject
    ? [...projectIds].sort().join() !==
      [...(current?.projectIds ?? [])].sort().join()
    : quantity !== (current?.quantity ?? 0);

  function save() {
    setLoading(true);
    void billingRequest(
      "/api/billing/add-ons",
      "PUT",
      {
        addOn: product.key,
        operationId: randomId(),
        projectIds: perProject ? projectIds : [],
        quantity: perProject ? projectIds.length : quantity,
        scopeId: scope.scopeId,
      },
      billingUpdatedSchema,
    ).then(
      async () => {
        await onSaved();
        toast.success(`${product.label} updated.`);
        setLoading(false);
      },
      (error: unknown) => {
        toast.error(
          error instanceof Error ? error.message : "Add-on update failed.",
        );
        setLoading(false);
      },
    );
  }

  return (
    <li className="py-3.5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-medium text-foreground">
            {product.label}
          </p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            {product.note}
          </p>
        </div>
        {perProject ? null : (
          <input
            aria-label={`${product.label} quantity`}
            className={cn(DASH_FIELD, "w-20 border px-3 text-right")}
            min={0}
            onChange={(event) =>
              setQuantity(Math.max(0, Number(event.target.value)))
            }
            type="number"
            value={quantity}
          />
        )}
        <Button
          disabled={loading || !scope.canManage || !changed}
          onClick={save}
          size="sm"
          variant="raised"
        >
          {loading ? "Saving…" : "Save"}
        </Button>
      </div>
      {perProject ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {scope.projects.map((project) => {
            const on = projectIds.includes(project.id);
            return (
              <button
                aria-pressed={on}
                className={cn(
                  "rounded-full px-3 py-1 text-[12px] transition-colors",
                  on
                    ? "bg-primary text-primary-foreground"
                    : "surface-inset text-muted-foreground hover:text-foreground",
                )}
                disabled={!scope.canManage}
                key={project.id}
                onClick={() =>
                  setProjectIds(
                    on
                      ? projectIds.filter((id) => id !== project.id)
                      : [...projectIds, project.id],
                  )
                }
                type="button"
              >
                {project.name}
              </button>
            );
          })}
        </div>
      ) : null}
    </li>
  );
}
