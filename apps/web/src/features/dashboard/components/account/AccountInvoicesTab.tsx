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
          <SelectTrigger className="h-9 w-44 rounded-md border-zinc-800 bg-zinc-900/60 px-3 text-xs font-medium text-zinc-200 hover:bg-zinc-800/80 focus:ring-1 focus:ring-zinc-700">
            <SelectValue placeholder="All Invoices" />
          </SelectTrigger>
          <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-200">
            <SelectItem value="all" className="text-xs focus:bg-zinc-800 focus:text-white">
              All Invoices
            </SelectItem>
            <SelectItem value="paid" className="text-xs focus:bg-zinc-800 focus:text-white">
              Paid Invoices
            </SelectItem>
            <SelectItem value="open" className="text-xs focus:bg-zinc-800 focus:text-white">
              Open Invoices
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices Container */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-6 min-h-[380px] flex flex-col justify-center">
        {filteredInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800/80 text-zinc-400">
                  <th className="pb-3 font-medium">Invoice</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
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
                    <tr key={inv.id || inv.stripeInvoiceId} className="hover:bg-zinc-900/30">
                      <td className="py-3 font-mono text-zinc-300">
                        {inv.stripeInvoiceId.slice(0, 16)}...
                      </td>
                      <td className="py-3 text-zinc-400">{date}</td>
                      <td className="py-3">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                            isPaid
                              ? "border-emerald-800/80 bg-emerald-950/80 text-emerald-400"
                              : "border-amber-800/80 bg-amber-950/80 text-amber-400"
                          }`}
                        >
                          {isPaid ? "Paid" : "Open"}
                        </span>
                      </td>
                      <td className="py-3 font-medium text-zinc-200">
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
                              "h-7 gap-1 text-xs text-zinc-300 hover:text-white",
                            )}
                          >
                            View <ExternalLink className="size-3" />
                          </a>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Exact empty state from the user's screenshot */
          <div className="flex flex-col items-center justify-center text-center py-16">
            <div className="flex size-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 mb-3.5">
              <FileText className="size-5" />
            </div>
            <h3 className="text-sm font-medium text-zinc-200">
              No invoices
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              You currently don&apos;t have any invoices.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
