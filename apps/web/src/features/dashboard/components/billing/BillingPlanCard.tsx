"use client";

import { DASH_FIELD } from "@/components/dashboard/menu";
import { StatusOrb } from "@/components/dashboard/StatusOrb";
import { LiveCreditCard, LiveZap } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import {
  SettingsCard,
  SettingsCardBody,
  SettingsCardFooter,
} from "@/features/dashboard/components/settings/SettingsCard";
import type {
  BillingOverview,
  BillingScopeSummary,
} from "@/features/dashboard/types/billing.types";
import { cn } from "@/lib/utils";

const DATE = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const ACTIVE = new Set(["active", "trialing"]);

interface BillingPlanCardProps {
  overview: BillingOverview;
  scope: BillingScopeSummary;
  onScope: (scopeId: string) => void;
  portalLoading: boolean;
  onPortal: () => void;
}

/** The plan this billing scope is on, what this period has cost, and where to pay. */
export function BillingPlanCard({
  overview,
  scope,
  onScope,
  portalLoading,
  onPortal,
}: BillingPlanCardProps) {
  const subscribed = Boolean(scope.subscriptionId);
  return (
    <SettingsCard id="billing">
      <SettingsCardBody
        aside={
          overview.scopes.length > 1 ? (
            <select
              aria-label="Billing scope"
              className={cn(DASH_FIELD, "w-48 border px-3")}
              onChange={(event) => onScope(event.target.value)}
              value={scope.scopeId}
            >
              {overview.scopes.map((item) => (
                <option key={item.scopeId} value={item.scopeId}>
                  {item.name}
                </option>
              ))}
            </select>
          ) : null
        }
        badge={
          <StatusOrb
            label={scope.status}
            pill
            tone={
              ACTIVE.has(scope.status)
                ? "ready"
                : subscribed
                  ? "building"
                  : "idle"
            }
          />
        }
        description="Paid products, metered overages, invoices and spend limits."
        icon={LiveCreditCard}
        title={`${scope.plan.charAt(0).toUpperCase()}${scope.plan.slice(1)} plan`}
      >
        <div className="flex flex-wrap items-end gap-x-10 gap-y-4">
          <div>
            <p className="figure text-[32px] font-semibold leading-none">
              ${(scope.estimatedUsageCents / 100).toFixed(2)}
            </p>
            <p className="mt-2 text-[12.5px] text-muted-foreground">
              Usage so far this period
            </p>
          </div>
          {scope.currentPeriodEnd ? (
            <div>
              <p className="figure text-[19px] font-semibold leading-none">
                {DATE.format(new Date(scope.currentPeriodEnd))}
              </p>
              <p className="mt-2 text-[12.5px] text-muted-foreground">
                Period renews
              </p>
            </div>
          ) : null}
        </div>
      </SettingsCardBody>
      <SettingsCardFooter
        action={
          subscribed ? (
            scope.canManage ? (
              <Button
                data-icon-trigger
                disabled={portalLoading}
                onClick={onPortal}
                size="sm"
                variant="raised"
              >
                <LiveCreditCard strokeWidth={1.75} />
                {portalLoading ? "Opening…" : "Payment method"}
              </Button>
            ) : null
          ) : scope.plan === "enterprise" ? null : (
            <Button
              data-icon-trigger
              onClick={() =>
                window.dispatchEvent(new CustomEvent("open-upgrade-sheet"))
              }
              size="sm"
              variant="hero"
            >
              <LiveZap strokeWidth={1.75} />
              Upgrade to Pro
            </Button>
          )
        }
        helperText={
          subscribed
            ? "Card details and receipts live in the secure billing portal."
            : scope.plan === "enterprise"
              ? "Every add-on is included in your plan."
              : "Upgrade to turn on paid add-ons and metered overages."
        }
      />
    </SettingsCard>
  );
}
