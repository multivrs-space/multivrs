import {
  SkeletonCard,
  SkeletonHeader,
  SkeletonRows,
} from "@/components/dashboard/SkeletonCard";
import { PageBody } from "@/features/dashboard/components/PageBody";

const SIGNALS = ["requests", "transfer", "latency", "errors"];

/** Mirrors the Observability overview: four signals, health, errors. */
export function ObservabilitySectionSkeleton() {
  return (
    <PageBody>
      <main aria-busy aria-label="Loading observability" className="space-y-5">
        <SkeletonHeader action="w-60" />
        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
          {SIGNALS.map((key) => (
            <SkeletonCard key={key}>
              <span className="skeleton block h-7 w-24" />
              <span className="skeleton mt-4 block h-20 w-full" />
            </SkeletonCard>
          ))}
        </div>
        <div className="grid gap-3 lg:grid-cols-12">
          <SkeletonCard className="lg:col-span-4">
            <div className="grid grid-cols-2 gap-2">
              <span className="skeleton block h-20 rounded-tile" />
              <span className="skeleton block h-20 rounded-tile" />
            </div>
          </SkeletonCard>
          <SkeletonCard className="lg:col-span-8">
            <SkeletonRows rows={4} />
          </SkeletonCard>
        </div>
      </main>
    </PageBody>
  );
}
