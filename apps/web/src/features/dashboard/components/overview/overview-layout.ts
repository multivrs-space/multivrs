/** Where each overview card sits on the 12-column grid, shared with loading. */
export const OVERVIEW_SLOTS = {
  traffic: "lg:col-span-8",
  insight: "lg:col-span-4",
  heat: "lg:col-span-7",
  deploys: "lg:col-span-5",
  recent: "lg:col-span-7",
  stack: "lg:col-span-5",
} as const;

/**
 * Card heights measured from the filled overview at desktop width. Real cards
 * use them as minimums too, so neither a skeleton nor an empty card shifts
 * the layout when the data lands.
 */
export const OVERVIEW_HEIGHTS = {
  kpi: "min-h-[192px]",
  traffic: "lg:min-h-[372px]",
  heat: "lg:min-h-[509px]",
  recent: "lg:min-h-[405px]",
} as const;
