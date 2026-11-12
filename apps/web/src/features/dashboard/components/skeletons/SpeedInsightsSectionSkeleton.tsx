import {
  SkeletonCard,
  SkeletonHeader,
  SkeletonRows,
} from "@/components/dashboard/SkeletonCard";
import { PageBody } from "@/features/dashboard/components/PageBody";

const VITALS = ["lcp", "inp", "cls", "ttfb"];

/** Mirrors Speed Insights: score gauge, four vitals, routes and devices. */
export function SpeedInsightsSectionSkeleton() {
  return (
    <PageBody>
      <main aria-busy aria-label="Loading Speed Insights" className="space-y-5">
        <SkeletonHeader action="w-40" />
        <div className="grid gap-3 lg:grid-cols-12">
          <SkeletonCard className="lg:col-span-5">
            <span className="skeleton mx-auto block aspect-[240/150] w-full max-w-[320px] rounded-t-full" />
          </SkeletonCard>
          <div className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
            {VITALS.map((key) => (
              <SkeletonCard icon key={key}>
                <span className="skeleton block h-7 w-24" />
                <span className="skeleton mt-6 block h-2 w-full rounded-full" />
              </SkeletonCard>
            ))}
          </div>
          <SkeletonCard className="lg:col-span-8">
            <SkeletonRows rows={6} />
          </SkeletonCard>
          <SkeletonCard className="lg:col-span-4">
            <SkeletonRows rows={3} />
          </SkeletonCard>
        </div>
      </main>
    </PageBody>
  );
}
