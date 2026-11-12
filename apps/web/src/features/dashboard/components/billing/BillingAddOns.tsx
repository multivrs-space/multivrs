"use client";

import { LiveBoxes } from "@/components/icons/animated";
import {
  type BillingAddOnProduct,
  BillingAddOnRow,
} from "@/features/dashboard/components/billing/BillingAddOnRow";
import {
  SettingsCard,
  SettingsCardBody,
} from "@/features/dashboard/components/settings/SettingsCard";
import type { BillingScopeSummary } from "@/features/dashboard/types/billing.types";

const PRODUCTS: BillingAddOnProduct[] = [
  {
    key: "developer_seat",
    label: "Additional developer seats",
    note: "$20 per seat / month",
  },
  {
    key: "speed_insights",
    label: "Speed Insights",
    note: "$10 per enabled project / month",
  },
  {
    key: "web_analytics_plus",
    label: "Web Analytics Plus",
    note: "$10 / month",
  },
  {
    key: "observability_plus",
    label: "Observability Plus",
    note: "$10 / month",
  },
  {
    key: "mail_volume",
    label: "Multivrs Mail Volume",
    note: "$10 per 5,000 email units / month",
  },
];

/** Paid add-ons for a subscribed scope; personal accounts have no seats. */
export function BillingAddOns({
  scope,
  onSaved,
}: {
  scope: BillingScopeSummary;
  onSaved: () => Promise<void>;
}) {
  if (!scope.subscriptionId) return null;
  return (
    <SettingsCard id="add-ons">
      <SettingsCardBody
        description="Each saves on its own and is billed from the next invoice."
        icon={LiveBoxes}
        title="Add-ons"
      >
        <ul className="divide-y divide-hairline">
          {PRODUCTS.filter(
            (product) =>
              scope.scopeId !== "personal" || product.key !== "developer_seat",
          ).map((product) => (
            <BillingAddOnRow
              key={product.key}
              onSaved={onSaved}
              product={product}
              scope={scope}
            />
          ))}
        </ul>
      </SettingsCardBody>
    </SettingsCard>
  );
}
