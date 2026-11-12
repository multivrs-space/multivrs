import { SkeletonHeader } from "@/components/dashboard/SkeletonCard";
import { PageBody } from "@/features/dashboard/components/PageBody";
import { SKELETON_ROWS } from "./skeleton.constants";

/** Mirrors the logs console: histogram, filters, rows. */
export function LogsSectionSkeleton() {
  return (
    <PageBody wide>
      <main aria-busy aria-label="Loading logs" className="space-y-5">
        <SkeletonHeader action="w-48" />
        <span
          aria-hidden="true"
          className="skeleton block h-9 w-56 rounded-full"
        />
        <div aria-hidden="true" className="surface-card rounded-card p-5">
          <div className="mb-5 flex flex-wrap gap-8">
            {["requests", "5xx", "4xx", "p50", "p95"].map((figure) => (
              <span className="space-y-1.5" key={figure}>
                <span className="skeleton block h-2.5 w-12" />
                <span className="skeleton block h-5 w-14" />
              </span>
            ))}
          </div>
          <span className="skeleton block h-20 w-full rounded-tile" />
          <span className="skeleton mt-3 block h-3 w-72 max-w-full" />
        </div>
        <div aria-hidden="true" className="flex flex-wrap gap-2">
          <span className="skeleton h-9 min-w-56 flex-1 rounded-control" />
          {["ok", "client", "server"].map((level) => (
            <span className="skeleton h-9 w-20 rounded-full" key={level} />
          ))}
        </div>
        <div
          aria-hidden="true"
          className="surface-card divide-y divide-hairline rounded-card"
        >
          {[...SKELETON_ROWS, ...SKELETON_ROWS].map((row, index) => (
            <div
              className="flex items-center gap-3 px-4 py-2.5"
              key={`${row}-${index > 4 ? "b" : "a"}`}
            >
              <span className="skeleton h-3 w-16" />
              <span className="skeleton h-4 w-10 rounded-full" />
              <span className="skeleton h-3 w-20" />
              <span className="skeleton h-3 flex-1" />
            </div>
          ))}
        </div>
      </main>
    </PageBody>
  );
}
