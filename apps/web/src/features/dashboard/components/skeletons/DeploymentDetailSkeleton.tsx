import {
  SkeletonCard,
  SkeletonHeader,
  SkeletonRows,
} from "@/components/dashboard/SkeletonCard";
import { PageBody } from "@/features/dashboard/components/PageBody";

/** Mirrors the deployment detail page: header, summary strip, build log. */
export function DeploymentDetailSkeleton() {
  return (
    <PageBody>
      <main aria-busy aria-label="Loading deployment" className="space-y-5">
        <span className="skeleton block h-4 w-28" />
        <SkeletonHeader action="w-40" />
        <div
          aria-hidden="true"
          className="surface-card grid gap-4 rounded-card p-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {["status", "source", "created", "address"].map((key) => (
            <div className="space-y-2" key={key}>
              <span className="skeleton block h-2.5 w-16" />
              <span className="skeleton block h-4 w-28" />
            </div>
          ))}
        </div>
        <SkeletonCard>
          <SkeletonRows rows={8} />
        </SkeletonCard>
      </main>
    </PageBody>
  );
}
