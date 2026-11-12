import {
  SkeletonCard,
  SkeletonHeader,
  SkeletonRows,
} from "@/components/dashboard/SkeletonCard";
import { PageBody } from "@/features/dashboard/components/PageBody";

const FACTS = [
  "expires",
  "price",
  "registrar",
  "renewal",
  "registered",
  "nameservers",
  "cdn",
];

/** Mirrors the domain page: header, facts strip, project, records, panels. */
export function DomainDetailSkeleton() {
  return (
    <PageBody>
      <main aria-busy aria-label="Loading domain" className="space-y-5">
        <span className="skeleton block h-4 w-24" />
        <SkeletonHeader action="w-10" />
        <div
          aria-hidden="true"
          className="surface-card grid gap-4 rounded-card p-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7"
        >
          {FACTS.map((fact) => (
            <div className="space-y-2" key={fact}>
              <span className="skeleton block h-2.5 w-16" />
              <span className="skeleton block h-4 w-24" />
            </div>
          ))}
        </div>
        <SkeletonCard>
          <span className="skeleton block h-14 w-full rounded-tile" />
        </SkeletonCard>
        <SkeletonCard>
          <SkeletonRows rows={4} />
        </SkeletonCard>
        <div className="grid gap-3 lg:grid-cols-2">
          <SkeletonCard>
            <SkeletonRows rows={2} />
          </SkeletonCard>
          <SkeletonCard>
            <SkeletonRows rows={2} />
          </SkeletonCard>
        </div>
      </main>
    </PageBody>
  );
}
