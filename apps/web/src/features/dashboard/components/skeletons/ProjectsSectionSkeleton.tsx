import { SkeletonHeader } from "@/components/dashboard/SkeletonCard";
import { PageBody } from "@/features/dashboard/components/PageBody";
import {
  ProjectCardsSkeleton,
  ProjectsHealthSkeleton,
  ProjectsUsageSummarySkeleton,
} from "@/features/dashboard/components/skeletons/ProjectCardsSkeleton";

/** Mirrors the Projects page: header, health and usage, toolbar, cards. */
export function ProjectsSectionSkeleton() {
  return (
    <PageBody>
      <main
        aria-busy
        aria-label="Loading projects"
        className="flex flex-1 flex-col gap-5"
      >
        <SkeletonHeader action="w-72" />
        <div className="grid gap-3 xl:grid-cols-12">
          <ProjectsHealthSkeleton className="xl:col-span-7" />
          <ProjectsUsageSummarySkeleton className="xl:col-span-5" />
        </div>
        <div aria-hidden="true" className="flex flex-wrap gap-2">
          <span className="skeleton h-9 w-72 max-w-full rounded-control" />
          <span className="skeleton ml-auto h-9 w-40 rounded-full" />
        </div>
        <ProjectCardsSkeleton layout="grid" />
      </main>
    </PageBody>
  );
}
