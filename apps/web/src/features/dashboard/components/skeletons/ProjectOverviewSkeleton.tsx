import {
  SkeletonCard,
  SkeletonRows,
} from "@/components/dashboard/SkeletonCard";
import { PageBody } from "@/features/dashboard/components/PageBody";

/** Mirrors ProjectOverviewPage: hero, pipeline and history, pulse and domains. */
export function ProjectOverviewSkeleton() {
  return (
    <PageBody>
      <main aria-busy aria-label="Loading project" className="space-y-5">
        <div
          aria-hidden="true"
          className="flex flex-wrap items-end justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <span className="skeleton size-12 rounded-tile" />
            <div className="space-y-2.5">
              <span className="skeleton block h-2.5 w-44" />
              <span className="skeleton block h-8 w-56" />
            </div>
          </div>
          <div className="flex gap-2">
            <span className="skeleton h-9 w-56 rounded-full" />
            <span className="skeleton h-9 w-24 rounded-full" />
          </div>
        </div>
        <div className="grid items-start gap-3 xl:grid-cols-12">
          <div className="space-y-3 xl:col-span-8">
            <SkeletonCard>
              <div className="grid gap-3 sm:grid-cols-3">
                {["source", "build", "edge"].map((key) => (
                  <div className="flex items-center gap-3" key={key}>
                    <span className="skeleton size-10 rounded-tile" />
                    <span className="skeleton h-3 w-20" />
                  </div>
                ))}
              </div>
            </SkeletonCard>
            <SkeletonCard>
              <SkeletonRows rows={5} />
            </SkeletonCard>
          </div>
          <div className="space-y-3 xl:col-span-4">
            <SkeletonCard>
              <span className="skeleton block h-8 w-28" />
              <span className="skeleton mt-4 block h-14 w-full" />
            </SkeletonCard>
            <SkeletonCard>
              <SkeletonRows rows={2} />
            </SkeletonCard>
          </div>
        </div>
      </main>
    </PageBody>
  );
}
