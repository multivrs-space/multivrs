import {
  SkeletonCard,
  SkeletonHeader,
  SkeletonRows,
} from "@/components/dashboard/SkeletonCard";
import { PageBody } from "@/features/dashboard/components/PageBody";

const MODES = ["smart", "aggressive", "bypass"];

/** Mirrors the CDN page: cache modes beside telemetry, then content sections. */
export function CdnSectionSkeleton() {
  return (
    <PageBody>
      <main aria-busy aria-label="Loading CDN" className="space-y-5">
        <SkeletonHeader action="w-56" />
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <SkeletonCard>
            <div className="grid gap-2 md:grid-cols-3">
              {MODES.map((mode) => (
                <span className="skeleton h-24 rounded-tile" key={mode} />
              ))}
            </div>
          </SkeletonCard>
          <SkeletonCard>
            <SkeletonRows rows={2} />
          </SkeletonCard>
        </div>
        <SkeletonCard>
          <SkeletonRows rows={3} />
        </SkeletonCard>
      </main>
    </PageBody>
  );
}
