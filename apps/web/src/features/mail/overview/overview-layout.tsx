import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";

/** Where each overview card sits, shared with its loading state. */
export const OVERVIEW_SLOTS = {
  volume: "lg:col-span-8",
  hero: "lg:col-span-4",
  recent: "lg:col-span-12 xl:col-span-6",
  health: "lg:col-span-6 xl:col-span-3",
  setup: "lg:col-span-6 xl:col-span-3",
} as const;

export function MailOverviewHeader() {
  return (
    <DashboardPageHeader
      description="Product mail, support conversations and campaigns in one place, with delivery states straight from the provider."
      eyebrow="Communicate"
      title="Emails"
    />
  );
}
