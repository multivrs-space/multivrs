/**
 * Shared class lists for dropdowns and popovers inside the dashboard, so every
 * menu is the same raised card with the same row shape.
 */
export const DASH_MENU =
  "dashboard-surface surface-card rounded-[16px] border-hairline bg-ink p-1.5 font-hanken text-foreground";

export const DASH_MENU_ITEM =
  "rounded-control px-2.5 py-2 text-[13px] font-normal text-muted-foreground focus:bg-foreground/5 focus:text-foreground";

/** Dialog content inside the dashboard: the same raised card as menus. */
export const DASH_DIALOG =
  "dashboard-surface surface-card rounded-[22px] border-hairline bg-ink p-6 font-hanken text-foreground ring-0";

/**
 * Form field look for inputs, selects and textareas in dashboard forms: a
 * recessed well. Plain utilities so tailwind-merge can replace the base
 * input's border and background.
 */
export const DASH_FIELD =
  "h-9 rounded-control border-hairline bg-foreground/[0.03] text-[13px] text-foreground shadow-[inset_0_1px_2px_rgb(0_0_0/0.05)] ring-offset-0 placeholder:text-muted-foreground/70 focus-visible:border-hairline-strong focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-0 dark:shadow-[inset_0_1px_3px_rgb(0_0_0/0.7)]";
