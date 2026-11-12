import {
  SkeletonCard,
  SkeletonRows,
} from "@/components/dashboard/SkeletonCard";

/** Mirrors mail analytics: totals, the daily chart and funnel, then health. */
export function MailAnalyticsSkeleton() {
  return (
    <div
      aria-busy
      aria-label="Loading mail analytics"
      role="status"
      className="grid gap-3 lg:grid-cols-12"
    >
      <SkeletonCard className="h-[156px] lg:col-span-12" />
      <SkeletonCard className="h-[372px] lg:col-span-8" />
      <SkeletonCard className="h-[372px] lg:col-span-4">
        <SkeletonRows rows={4} />
      </SkeletonCard>
      <SkeletonCard className="h-[360px] lg:col-span-6" />
      <SkeletonCard className="h-[360px] lg:col-span-6" />
    </div>
  );
}
