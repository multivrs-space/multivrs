"use client";

import { useState } from "react";
import { toast } from "sonner";
import { BillingAddOns } from "@/features/dashboard/components/billing/BillingAddOns";
import { BillingInvoices } from "@/features/dashboard/components/billing/BillingInvoices";
import { BillingPlanCard } from "@/features/dashboard/components/billing/BillingPlanCard";
import { BillingSpendControls } from "@/features/dashboard/components/billing/BillingSpendControls";
import { billingRequest } from "@/features/dashboard/lib/billing-api";
import type { BillingOverview } from "@/features/dashboard/types/billing.types";
import {
  billingOverviewSchema,
  billingPortalResponseSchema,
} from "@/lib/schemas/billing.schemas";

/** Plan, add-ons, spend limits and invoices for each billing scope you can see. */
export function BillingManager({ initial }: { initial: BillingOverview }) {
  const [overview, setOverview] = useState(initial);
  const [scopeId, setScopeId] = useState(
    initial.scopes[0]?.scopeId ?? "personal",
  );
  const [portalLoading, setPortalLoading] = useState(false);
  const scope =
    overview.scopes.find((item) => item.scopeId === scopeId) ??
    overview.scopes[0];

  async function refresh() {
    const response = await fetch("/api/billing/overview");
    if (!response.ok) throw new Error("Could not refresh billing details.");
    setOverview(billingOverviewSchema.parse(await response.json()));
  }

  function openPortal() {
    if (!scope || portalLoading) return;
    setPortalLoading(true);
    void billingRequest(
      "/api/billing/portal",
      "POST",
      { scopeId: scope.scopeId },
      billingPortalResponseSchema,
    ).then(
      (response) => window.location.assign(response.url),
      (error: unknown) => {
        toast.error(
          error instanceof Error ? error.message : "Could not open billing.",
        );
        setPortalLoading(false);
      },
    );
  }

  if (!scope) return null;
  return (
    <div className="space-y-3">
      <BillingPlanCard
        onPortal={openPortal}
        onScope={setScopeId}
        overview={overview}
        portalLoading={portalLoading}
        scope={scope}
      />
      <BillingAddOns
        key={`addons-${scope.scopeId}`}
        onSaved={refresh}
        scope={scope}
      />
      <BillingSpendControls
        key={`spend-${scope.scopeId}`}
        onSaved={refresh}
        scope={scope}
      />
      <BillingInvoices invoices={scope.invoices} />
    </div>
  );
}
