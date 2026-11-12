import type { ProjectLayout } from "@/features/dashboard/components/ProjectsToolbar";
import { cn } from "@/lib/utils";

const CARD_KEYS = ["one", "two", "three", "four", "five", "six"];

/** Matches ProjectCard: face row, deploy line, repository strip. */
export function ProjectCardsSkeleton({ layout }: { layout: ProjectLayout }) {
  return (
    <div
      aria-label="Loading projects"
      aria-live="polite"
      className={
        layout === "grid"
          ? "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
          : "grid grid-cols-1 gap-3"
      }
      role="status"
    >
      {CARD_KEYS.map((key) => (
        <article
          aria-hidden="true"
          className="surface-card flex h-[170px] flex-col rounded-card"
          key={key}
        >
          <div className="flex items-center gap-3 p-4 pb-3">
            <span className="skeleton size-11 rounded-tile" />
            <span className="flex-1 space-y-2">
              <span className="skeleton block h-3.5 w-2/5" />
              <span className="skeleton block h-3 w-3/5" />
            </span>
            <span className="skeleton h-6 w-16 rounded-full" />
          </div>
          <span className="skeleton mx-4 block h-3 w-3/4" />
          <span className="skeleton mx-2 mb-2 mt-auto block h-8 rounded-tile" />
        </article>
      ))}
    </div>
  );
}

export function ProjectsHealthSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "surface-card grid grid-cols-2 rounded-card md:grid-cols-4",
        className,
      )}
    >
      {CARD_KEYS.slice(0, 4).map((key) => (
        <div className="space-y-3 p-4" key={key}>
          <span className="skeleton block h-3 w-20" />
          <span className="skeleton block h-7 w-10" />
        </div>
      ))}
    </div>
  );
}

/** Matches ProjectsUsageSummary: a header line and four ringed meters. */
export function ProjectsUsageSummarySkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("surface-card rounded-card p-4", className)}
    >
      <span className="skeleton block h-3.5 w-48" />
      <span className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
        {CARD_KEYS.slice(0, 4).map((key) => (
          <span className="flex items-center gap-2.5" key={key}>
            <span className="skeleton size-10 rounded-full" />
            <span className="flex-1 space-y-1.5">
              <span className="skeleton block h-2.5 w-14" />
              <span className="skeleton block h-3 w-10" />
            </span>
          </span>
        ))}
      </span>
    </div>
  );
}

/** Matches UsageView: plan card and chart, then the meter table. */
export function ProjectsUsageSkeleton() {
  return (
    <div aria-label="Loading usage" className="space-y-3" role="status">
      <div aria-hidden="true" className="grid gap-3 lg:grid-cols-12">
        <div className="surface-card min-h-[300px] rounded-card p-5 lg:col-span-4 lg:min-h-[420px]">
          <span className="skeleton block h-6 w-24 rounded-full" />
          <span className="skeleton mt-6 block h-3 w-40" />
          <span className="skeleton mt-2 block h-10 w-36" />
          <span className="skeleton mt-4 block h-4 w-full" />
        </div>
        <div className="surface-card min-h-[420px] rounded-card p-5 lg:col-span-8">
          <span className="skeleton block h-4 w-40" />
          <span className="skeleton mt-6 block h-10 w-32" />
          <span className="skeleton mt-6 block h-56 rounded-tile" />
        </div>
      </div>
      <div aria-hidden="true" className="surface-card rounded-card p-5">
        <span className="skeleton block h-4 w-32" />
        {[3, 2, 4].map((rows, index) => (
          <div className="pt-6" key={CARD_KEYS[index]}>
            <span className="skeleton block h-3.5 w-28" />
            <div className="mt-3 grid gap-x-4 gap-y-4 md:grid-cols-2">
              {CARD_KEYS.slice(0, rows).map((row) => (
                <span className="block space-y-2" key={row}>
                  <span className="skeleton block h-3 w-1/2" />
                  <span className="skeleton block h-1.5 w-full rounded-full" />
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
