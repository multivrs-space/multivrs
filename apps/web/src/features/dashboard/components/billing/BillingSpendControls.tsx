"use client";

import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { DASH_FIELD } from "@/components/dashboard/menu";
import { LiveGauge } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  SettingsCard,
  SettingsCardBody,
  SettingsCardFooter,
} from "@/features/dashboard/components/settings/SettingsCard";
import { billingRequest } from "@/features/dashboard/lib/billing-api";
import type { BillingScopeSummary } from "@/features/dashboard/types/billing.types";
import { randomId } from "@/lib/browser/random-id";
import { billingUpdatedSchema } from "@/lib/schemas/billing.schemas";
import { cn } from "@/lib/utils";

const cents = (value: FormDataEntryValue | null) =>
  typeof value === "string" && value.trim()
    ? Math.round(Number(value) * 100)
    : null;
const money = (value: number | null) =>
  value === null ? "" : (value / 100).toFixed(2);

/** Overages on or off, an alert threshold and a hard monthly cap. */
export function BillingSpendControls({
  scope,
  onSaved,
}: {
  scope: BillingScopeSummary;
  onSaved: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [overages, setOverages] = useState(scope.overagesEnabled);
  if (!scope.subscriptionId) return null;

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    void billingRequest(
      "/api/billing/spend",
      "PUT",
      {
        operationId: randomId(),
        overagesEnabled: overages,
        scopeId: scope.scopeId,
        spendAlertCents: cents(form.get("alert")),
        spendLimitCents: cents(form.get("limit")),
      },
      billingUpdatedSchema,
    )
      .then(async () => {
        await onSaved();
        toast.success("Spend limits updated.");
      })
      .catch((error: unknown) =>
        toast.error(
          error instanceof Error
            ? error.message
            : "Spend policy update failed.",
        ),
      )
      .finally(() => setLoading(false));
  }

  return (
    <SettingsCard id="spend">
      <form onSubmit={save}>
        <SettingsCardBody
          aside={
            <Switch
              aria-label="Paid usage overages"
              checked={overages}
              disabled={!scope.canManage}
              onCheckedChange={setOverages}
            />
          }
          description="Paid usage above your included allowances, with a hard stop at the monthly limit."
          icon={LiveGauge}
          title="Overages and limits"
        >
          <div className="grid max-w-md gap-3 sm:grid-cols-2">
            {[
              {
                name: "alert",
                label: "Alert at (USD)",
                value: scope.spendAlertCents,
                placeholder: "10.00",
              },
              {
                name: "limit",
                label: "Hard limit (USD)",
                value: scope.spendLimitCents,
                placeholder: "25.00",
              },
            ].map((field) => (
              <label
                className="space-y-1.5 text-[12px] text-muted-foreground"
                htmlFor={`spend-${field.name}`}
                key={field.name}
              >
                {field.label}
                <input
                  className={cn(DASH_FIELD, "mt-1.5 w-full border px-3")}
                  defaultValue={money(field.value)}
                  id={`spend-${field.name}`}
                  min="1"
                  name={field.name}
                  placeholder={field.placeholder}
                  step="0.01"
                  type="number"
                />
              </label>
            ))}
          </div>
        </SettingsCardBody>
        <SettingsCardFooter
          action={
            <Button
              disabled={loading || !scope.canManage}
              size="sm"
              type="submit"
              variant="hero"
            >
              {loading ? "Saving…" : "Save limits"}
            </Button>
          }
          helperText="Stripe meters only usage above your included allowances."
        />
      </form>
    </SettingsCard>
  );
}
