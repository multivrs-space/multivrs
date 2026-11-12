"use client";

import { useState } from "react";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { SegmentedControl } from "@/components/dashboard/SegmentedControl";
import { type OrbTone, StatusOrb } from "@/components/dashboard/StatusOrb";
import { LiveArrowUpRight, LiveReceipt } from "@/components/icons/animated";
import {
  SettingsCard,
  SettingsCardBody,
} from "@/features/dashboard/components/settings/SettingsCard";

export interface InvoiceItem {
  id: string;
  stripeInvoiceId: string;
  amountDueCents: number;
  amountPaidCents: number;
  amountRemainingCents: number;
  currency: string;
  status: string;
  hostedInvoiceUrl?: string | null;
  createdAt: string;
}

type Filter = "all" | "paid" | "due";

const DUE = new Set(["open", "past_due", "unpaid"]);
const STATUS: Record<string, { label: string; tone: OrbTone }> = {
  paid: { label: "Paid", tone: "ready" },
  open: { label: "Due", tone: "building" },
  past_due: { label: "Past due", tone: "error" },
  unpaid: { label: "Unpaid", tone: "error" },
  draft: { label: "Draft", tone: "queued" },
  void: { label: "Void", tone: "idle" },
  uncollectible: { label: "Uncollectible", tone: "idle" },
};
const DATE = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** Every invoice across your billing scopes, filterable by paid or due. */
export function AccountInvoicesTab({
  invoices = [],
}: {
  invoices?: InvoiceItem[];
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const status = (invoice: InvoiceItem) => invoice.status.toLowerCase();
  const paid = invoices.filter((invoice) => status(invoice) === "paid");
  const due = invoices.filter((invoice) => DUE.has(status(invoice)));
  const shown = filter === "paid" ? paid : filter === "due" ? due : invoices;

  return (
    <SettingsCard id="invoices">
      <SettingsCardBody
        aside={
          invoices.length ? (
            <SegmentedControl
              aria-label="Filter invoices"
              onChange={setFilter}
              options={[
                { value: "all", label: "All", count: invoices.length },
                { value: "paid", label: "Paid", count: paid.length },
                { value: "due", label: "Due", count: due.length },
              ]}
              value={filter}
            />
          ) : null
        }
        description="From every billing scope you manage, newest first."
        icon={LiveReceipt}
        title="Invoices"
      />
      {shown.length ? (
        <ul className="divide-y divide-hairline px-5 pb-3 sm:px-6">
          {shown.map((invoice) => {
            const state = STATUS[status(invoice)] ?? {
              label: invoice.status,
              tone: "idle" as const,
            };
            const cents =
              status(invoice) === "paid"
                ? invoice.amountPaidCents
                : invoice.amountDueCents;
            return (
              <li
                className="flex items-center gap-3 py-3"
                key={invoice.id || invoice.stripeInvoiceId}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-geist-mono text-[12px] text-foreground/85">
                    {invoice.stripeInvoiceId}
                  </p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    {DATE.format(new Date(invoice.createdAt))}
                  </p>
                </div>
                <StatusOrb label={state.label} pill tone={state.tone} />
                <p className="figure w-24 text-right text-[14px] font-semibold">
                  {(cents / 100).toLocaleString("en-US", {
                    style: "currency",
                    currency: invoice.currency || "USD",
                  })}
                </p>
                {invoice.hostedInvoiceUrl ? (
                  <a
                    aria-label={`Open invoice ${invoice.stripeInvoiceId}`}
                    className="surface-raised surface-press grid size-8 place-items-center rounded-full text-muted-foreground hover:text-foreground"
                    data-icon-trigger
                    href={invoice.hostedInvoiceUrl}
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    <LiveArrowUpRight className="size-3.5" strokeWidth={2} />
                  </a>
                ) : (
                  <span className="size-8" />
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          className="pt-2"
          description={
            invoices.length
              ? "Nothing matches this filter."
              : "Invoices appear here after your first paid billing period."
          }
          glyph={LiveReceipt}
          title={invoices.length ? "No invoices here" : "No invoices yet"}
        />
      )}
    </SettingsCard>
  );
}
