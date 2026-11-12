import { SkeletonHeader } from "@/components/dashboard/SkeletonCard";
import { PageBody } from "@/features/dashboard/components/PageBody";
import { DashboardPageHeader } from "../DashboardPageHeader";
import { SKELETON_ROWS } from "./skeleton.constants";

export function SectionLoadingHeader({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return <DashboardPageHeader description={description} title={title} />;
}

export function SectionSkeletonHeader({
  action = false,
}: {
  titleWidth?: string;
  action?: boolean;
}) {
  return <SkeletonHeader action={action ? "w-32" : undefined} />;
}

export function ProjectPickerSkeleton() {
  return (
    <PageBody>
      <main aria-busy className="space-y-5">
        <SkeletonHeader />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {SKELETON_ROWS.slice(0, 3).map((row) => (
            <div
              aria-hidden="true"
              className="surface-card h-36 rounded-card p-5"
              key={row}
            >
              <span className="skeleton block size-9 rounded-tile" />
              <span className="skeleton mt-5 block h-4 w-1/2" />
              <span className="skeleton mt-3 block h-3 w-3/4" />
            </div>
          ))}
        </div>
      </main>
    </PageBody>
  );
}
