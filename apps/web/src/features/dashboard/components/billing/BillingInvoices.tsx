import { StatusOrb } from "@/components/dashboard/StatusOrb";
import { LiveArrowUpRight, LiveReceipt } from "@/components/icons/animated";
import {
  SettingsCard,
  SettingsCardBody,
} from "@/features/dashboard/components/settings/SettingsCard";
import type { BillingInvoiceSummary } from "@/features/dashboard/types/billing.types";

const AMOUNT = new Intl.NumberFormat("en", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

/** The last few invoices for this scope, each linking to its hosted copy. */
export function BillingInvoices({
  invoices,
}: {
  invoices: BillingInvoiceSummary[];
}) {
  if (!invoices.length) return null;
  return (
    <SettingsCard id="invoices">
      <SettingsCardBody
        description="The latest five. Older ones are in the billing portal."
        icon={LiveReceipt}
        title="Recent invoices"
      >
        <ul className="divide-y divide-hairline">
          {invoices.map((invoice) => (
            <li className="flex items-center gap-3 py-3" key={invoice.id}>
              <div className="min-w-0 flex-1">
                <p className="truncate font-geist-mono text-[12px] text-foreground/85">
                  {invoice.id}
                </p>
                <StatusOrb
                  className="mt-1"
                  label={invoice.status}
                  pill
                  tone={
                    invoice.status === "paid"
                      ? "ready"
                      : invoice.status === "open"
                        ? "building"
                        : "idle"
                  }
                />
              </div>
              <p className="figure text-[14px] font-semibold">
                {invoice.currency.toUpperCase()}{" "}
                {AMOUNT.format(invoice.amountDueCents / 100)}
              </p>
              {invoice.hostedInvoiceUrl ? (
                <a
                  aria-label={`Open invoice ${invoice.id}`}
                  className="surface-raised surface-press grid size-8 place-items-center rounded-full text-muted-foreground hover:text-foreground"
                  data-icon-trigger
                  href={invoice.hostedInvoiceUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <LiveArrowUpRight className="size-3.5" strokeWidth={2} />
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      </SettingsCardBody>
    </SettingsCard>
  );
}
