import {
  SkeletonCard,
  SkeletonHeader,
} from "@/components/dashboard/SkeletonCard";
import { PageBody } from "@/features/dashboard/components/PageBody";

/** The configure step while the repository details load: form left, summary right. */
export function NewProjectImportSkeleton() {
  return (
    <PageBody>
      <span
        aria-hidden="true"
        className="skeleton block h-8 w-44 rounded-full"
      />
      <SkeletonHeader />
      <div
        aria-busy
        aria-label="Loading repository"
        className="grid items-start gap-3 lg:grid-cols-12"
        role="status"
      >
        <div className="grid gap-3 lg:col-span-8">
          <SkeletonCard>
            <div className="grid gap-4 sm:grid-cols-2">
              <span className="skeleton h-10 rounded-control sm:col-span-2" />
              <span className="skeleton h-10 rounded-control" />
              <span className="skeleton h-10 rounded-control" />
            </div>
          </SkeletonCard>
          <SkeletonCard>
            <div className="space-y-4">
              {["install", "build", "output"].map((row) => (
                <span
                  className="skeleton block h-10 rounded-control"
                  key={row}
                />
              ))}
            </div>
          </SkeletonCard>
        </div>
        <SkeletonCard className="lg:col-span-4">
          <div className="space-y-3">
            <span className="skeleton block h-48 rounded-tile" />
            <span className="skeleton block h-11 rounded-full" />
          </div>
        </SkeletonCard>
      </div>
    </PageBody>
  );
}
