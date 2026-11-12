import { z } from "zod";

export const projectNavSummarySchema = z.object({
  name: z.string(),
  slug: z.string(),
  faviconUrl: z.string().nullable(),
  siteLabel: z.string().nullable(),
  status: z.enum(["ready", "building", "error", "idle"]),
  counts: z.record(z.string(), z.number()),
});
