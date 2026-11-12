import { z } from "zod";
import type { ImportContact } from "@/features/mail/contacts/contact-merge";
import { CONTACT_IMPORT_BATCH } from "@/lib/schemas/mail-resource.schemas";

const resultSchema = z.object({
  created: z.number(),
  updated: z.number(),
  unchanged: z.number(),
  addedToAudience: z.number(),
});

const errorSchema = z.object({
  error: z.object({ message: z.string().min(1) }),
});

export type ImportTotals = z.infer<typeof resultSchema>;

export interface ImportOptions {
  account?: string;
  audienceId?: string;
  tags: string[];
  onProgress: (sent: number) => void;
}

/**
 * Send contacts a batch at a time, reporting progress after each, so a
 * 50,000-row list shows movement every second instead of one long wait.
 * Batches already sent stay imported if a later one fails.
 */
export async function importContactBatches(
  contacts: ImportContact[],
  options: ImportOptions,
): Promise<
  | { ok: true; totals: ImportTotals }
  | { ok: false; message: string; totals: ImportTotals }
> {
  const totals: ImportTotals = {
    created: 0,
    updated: 0,
    unchanged: 0,
    addedToAudience: 0,
  };
  for (let start = 0; start < contacts.length; start += CONTACT_IMPORT_BATCH) {
    const batch = contacts.slice(start, start + CONTACT_IMPORT_BATCH);
    const response = await fetch("/api/mail/contacts/import", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...(options.account ? { account: options.account } : {}),
        contacts: batch,
        audienceId: options.audienceId,
        tags: options.tags,
        consent: true,
      }),
    }).catch(() => null);
    const body: unknown = await response?.json().catch(() => null);
    const result = resultSchema.safeParse(body);
    if (!response?.ok || !result.success) {
      const error = errorSchema.safeParse(body);
      return {
        ok: false,
        totals,
        message: error.success
          ? error.data.error.message
          : "The import stopped. Try again.",
      };
    }
    for (const key of Object.keys(totals) as (keyof ImportTotals)[])
      totals[key] += result.data[key];
    options.onProgress(start + batch.length);
  }
  return { ok: true, totals };
}
