import {
  SkeletonCard,
  SkeletonHeader,
  SkeletonRows,
} from "@/components/dashboard/SkeletonCard";
import { PageBody } from "@/features/dashboard/components/PageBody";

/** Mirrors environment variables: the add form, then the list. */
export function EnvironmentSectionSkeleton() {
  return (
    <PageBody>
      <main
        aria-busy
        aria-label="Loading environment variables"
        className="space-y-5"
      >
        <SkeletonHeader />
        <SkeletonCard>
          <div className="grid gap-3 lg:grid-cols-[1fr_1.5fr_auto]">
            <span className="skeleton h-9 rounded-control" />
            <span className="skeleton h-9 rounded-control" />
            <span className="skeleton h-9 w-24 rounded-full" />
          </div>
        </SkeletonCard>
        <SkeletonCard>
          <SkeletonRows rows={5} />
        </SkeletonCard>
      </main>
    </PageBody>
  );
}
