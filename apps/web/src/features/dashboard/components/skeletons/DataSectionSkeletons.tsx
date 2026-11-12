import {
  SkeletonCard,
  SkeletonHeader,
  SkeletonRows,
} from "@/components/dashboard/SkeletonCard";
import { PageBody } from "@/features/dashboard/components/PageBody";
import { SKELETON_ROWS } from "./skeleton.constants";

function Toolbar({ controls = 2 }: { controls?: number }) {
  return (
    <div aria-hidden="true" className="flex flex-wrap gap-2">
      <span className="skeleton h-9 min-w-56 flex-1 rounded-control" />
      {Array.from({ length: controls }, (_, index) => index).map((index) => (
        <span className="skeleton h-9 w-56 rounded-full" key={index} />
      ))}
    </div>
  );
}

export function DeploymentsSectionSkeleton() {
  return (
    <PageBody>
      <main aria-busy className="space-y-5">
        <SkeletonHeader />
        <Toolbar />
        <DeploymentsTableSkeleton />
      </main>
    </PageBody>
  );
}

/** Day label, then a card of deployment rows. */
export function DeploymentsTableSkeleton() {
  return (
    <div aria-label="Loading deployments" className="space-y-2" role="status">
      <span className="skeleton block h-2.5 w-16" />
      <div
        aria-hidden="true"
        className="surface-card divide-y divide-hairline rounded-card p-1.5"
      >
        {SKELETON_ROWS.map((row) => (
          <div className="flex items-center gap-4 px-3 py-3.5" key={row}>
            <span className="skeleton size-2 rounded-full" />
            <span className="flex-1 space-y-2">
              <span className="skeleton block h-3 w-2/5" />
              <span className="skeleton block h-2.5 w-1/3" />
            </span>
            <span className="skeleton hidden h-3 w-20 sm:block" />
            <span className="skeleton h-3 w-14" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DomainsSectionSkeleton() {
  return (
    <PageBody>
      <main aria-busy className="space-y-5">
        <SkeletonHeader action="w-32" />
        <Toolbar controls={1} />
        <SkeletonCard icon={false}>
          <SkeletonRows rows={5} />
        </SkeletonCard>
      </main>
    </PageBody>
  );
}

export function SandboxesSectionSkeleton() {
  return (
    <PageBody>
      <main aria-busy className="space-y-5">
        <SkeletonHeader action="w-36" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {SKELETON_ROWS.slice(0, 3).map((row) => (
            <SkeletonCard key={row}>
              <SkeletonRows rows={2} />
            </SkeletonCard>
          ))}
        </div>
      </main>
    </PageBody>
  );
}

export function WorkflowsSectionSkeleton() {
  return (
    <PageBody>
      <main aria-busy className="space-y-5">
        <SkeletonHeader />
        <SkeletonCard>
          <SkeletonRows rows={3} />
        </SkeletonCard>
      </main>
    </PageBody>
  );
}
