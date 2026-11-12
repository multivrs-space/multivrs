"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { PaymentMethodSummary } from "@/app/api/billing/payment-method/route";
import { SkeletonRows } from "@/components/dashboard/SkeletonCard";
import {
  LiveCreditCard,
  LiveFileText,
  LiveZap,
} from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import {
  SettingsBadge,
  SettingsCard,
  SettingsCardBody,
  SettingsCardFooter,
} from "@/features/dashboard/components/settings/SettingsCard";

const PLANNED = [
  "Company name",
  "Billing address",
  "Tax ID",
  "Purchase order number",
  "Invoice language",
];

/** The card on file, and the invoice details that are still to come. */
export function AccountBillingInformationTab() {
  const [card, setCard] = useState<PaymentMethodSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    fetch("/api/billing/payment-method")
      .then((response) => (response.ok ? response.json() : null))
      .then((body: { data?: PaymentMethodSummary } | null) =>
        setCard(body?.data ?? null),
      )
      .catch(() => setCard(null))
      .finally(() => setLoading(false));
  }, []);

  async function openPortal() {
    setOpening(true);
    const response = await fetch("/api/billing/portal", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ scopeId: "personal" }),
    }).catch(() => null);
    const body = (await response?.json().catch(() => null)) as {
      data?: { url?: string };
    } | null;
    if (response?.ok && body?.data?.url)
      return window.location.assign(body.data.url);
    toast.error(
      "The billing portal couldn't open. It's available once you're on a paid plan.",
    );
    setOpening(false);
  }

  return (
    <div className="space-y-3">
      <SettingsCard id="payment-method">
        <SettingsCardBody
          description="Domains, add-ons and usage are charged to this card."
          icon={LiveCreditCard}
          title="Payment method"
        >
          {loading ? (
            <SkeletonRows rows={1} />
          ) : card?.hasPaymentMethod ? (
            <div className="surface-inset flex max-w-md items-center gap-3 rounded-tile p-3.5">
              <span className="surface-raised grid h-9 w-12 place-items-center rounded-[7px] font-geist-mono text-[10px] font-semibold uppercase text-muted-foreground">
                {card.brand ?? "card"}
              </span>
              <div>
                <p className="figure text-[14px] font-semibold capitalize">
                  {card.brand ?? "Card"} •••• {card.last4}
                </p>
                <p className="text-[12px] text-muted-foreground">
                  Expires {card.expMonth}/{card.expYear}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-[13px] text-muted-foreground">
              No card on file. You add one when you upgrade.
            </p>
          )}
        </SettingsCardBody>
        <SettingsCardFooter
          action={
            card?.hasPaymentMethod ? (
              <Button
                data-icon-trigger
                disabled={opening}
                onClick={() => void openPortal()}
                size="sm"
                variant="raised"
              >
                <LiveCreditCard strokeWidth={1.75} />
                {opening ? "Opening…" : "Manage cards"}
              </Button>
            ) : (
              <Button
                data-icon-trigger
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("open-upgrade-sheet"))
                }
                size="sm"
                variant="hero"
              >
                <LiveZap strokeWidth={1.75} />
                Upgrade
              </Button>
            )
          }
          helperText="Cards are stored by Stripe, never by Multivrs."
        />
      </SettingsCard>
      <SettingsCard id="invoice-details">
        <SettingsCardBody
          badge={<SettingsBadge>Planned</SettingsBadge>}
          description="Putting your business details on invoices is coming. Nothing is collected here until then."
          icon={LiveFileText}
          title="Invoice details"
        >
          <ul className="flex flex-wrap gap-1.5">
            {PLANNED.map((item) => (
              <li
                className="hatch rounded-full px-3 py-1 text-[12px] text-muted-foreground"
                key={item}
              >
                {item}
              </li>
            ))}
          </ul>
        </SettingsCardBody>
      </SettingsCard>
    </div>
  );
}
