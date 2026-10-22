"use client";

import { useState } from "react";
import { ExternalLink, FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

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

interface AccountInvoicesTabProps {
  invoices?: InvoiceItem[];
}

export function AccountInvoicesTab({
  invoices = [],
}: AccountInvoicesTabProps) {
  const [filter, setFilter] = useState<"all" | "paid" | "open">("all");

  const filteredInvoices = invoices.filter((inv) => {
    if (filter === "paid") {
      return inv.status.toLowerCase() === "paid";
    }
    if (filter === "open") {
      return (
        inv.status.toLowerCase() === "open" ||
        inv.status.toLowerCase() === "past_due" ||
        inv.status.toLowerCase() === "unpaid"
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filter selector matching Vercel */}
      <div>
        <Select
          value={filter}
          onValueChange={(val) => setFilter(val as "all" | "paid" | "open")}
        >
          <SelectTrigger className="h-9 w-44 rounded-md border-border bg-background px-3 text-xs font-medium text-foreground hover:bg-muted focus:ring-1 focus:ring-ring">
            <SelectValue placeholder="All Invoices" />
          </SelectTrigger>
          <SelectContent className="border-border bg-popover text-popover-foreground">
            <SelectItem value="all" className="text-xs">
              All Invoices
            </SelectItem>
            <SelectItem value="paid" className="text-xs">
              Paid Invoices
            </SelectItem>
            <SelectItem value="open" className="text-xs">
              Open Invoices
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices Container */}
      <div className="rounded-xl border border-border bg-card p-6 min-h-[380px] flex flex-col justify-center">
        {filteredInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-3 font-medium">Invoice</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredInvoices.map((inv) => {
                  const isPaid = inv.status.toLowerCase() === "paid";
                  const amount = (
                    (isPaid ? inv.amountPaidCents : inv.amountDueCents) / 100
                  ).toLocaleString("en-US", {
                    style: "currency",
                    currency: inv.currency || "USD",
                  });
                  const date = new Date(inv.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    },
                  );

                  return (
                    <tr key={inv.id || inv.stripeInvoiceId} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 font-mono text-foreground">
                        {inv.stripeInvoiceId.slice(0, 16)}...
                      </td>
                      <td className="py-3 text-muted-foreground">{date}</td>
                      <td className="py-3">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                            isPaid
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {isPaid ? "Paid" : "Open"}
                        </span>
                      </td>
                      <td className="py-3 font-medium text-foreground">
                        {amount}
                      </td>
                      <td className="py-3 text-right">
                        {inv.hostedInvoiceUrl ? (
                          <a
                            href={inv.hostedInvoiceUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className={cn(
                              buttonVariants({ variant: "ghost", size: "sm" }),
                              "h-7 gap-1 text-xs text-muted-foreground hover:text-foreground",
                            )}
                          >
                            View <ExternalLink className="size-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Exact empty state matching Vercel style */
          <div className="flex flex-col items-center justify-center text-center py-16">
            <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted/60 text-muted-foreground mb-3.5">
              <FileText className="size-5" />
            </div>
            <h3 className="text-sm font-medium text-foreground">
              No invoices
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              You currently don&apos;t have any invoices.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
