import {
  SkeletonCard,
  SkeletonHeader,
  SkeletonRows,
} from "@/components/dashboard/SkeletonCard";
import { PageBody } from "@/features/dashboard/components/PageBody";

/** Mirrors the Web Analytics bento so the page settles without shifting. */
export function AnalyticsSectionSkeleton() {
  return (
    <PageBody>
      <main aria-busy aria-label="Loading analytics">
        <SkeletonHeader action="w-40" />
        <div className="mt-5 grid gap-3 lg:grid-cols-12">
          <div className="grid content-start gap-3 lg:col-span-5">
            <SkeletonCard>
              <div className="grid grid-cols-3 gap-4 pt-1">
                {["visitors", "views", "bounce"].map((key) => (
                  <div className="space-y-2" key={key}>
                    <span className="skeleton block h-7 w-20" />
                    <span className="skeleton block h-2.5 w-16" />
                  </div>
                ))}
              </div>
            </SkeletonCard>
            <div className="grid gap-3 sm:grid-cols-2">
              {["requests", "errors"].map((key) => (
                <SkeletonCard key={key}>
                  <span className="skeleton block h-7 w-20" />
                  <span className="skeleton mt-4 block h-14 w-full" />
                </SkeletonCard>
              ))}
            </div>
          </div>
          <SkeletonCard className="min-h-[380px] lg:col-span-7">
            <span className="skeleton block h-full min-h-[280px] w-full rounded-tile" />
          </SkeletonCard>
          <SkeletonCard className="lg:col-span-7">
            <span className="skeleton mb-5 block h-8 w-64 rounded-full" />
            <SkeletonRows rows={6} />
          </SkeletonCard>
          <SkeletonCard className="lg:col-span-5">
            <span className="skeleton block h-64 w-full rounded-tile" />
          </SkeletonCard>
        </div>
      </main>
    </PageBody>
  );
}
