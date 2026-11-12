import {
  SkeletonCard,
  SkeletonHeader,
  SkeletonRows,
} from "@/components/dashboard/SkeletonCard";
import { PageBody } from "@/features/dashboard/components/PageBody";

const CHECKS = ["dkim", "spf", "dmarc", "receiving"];

/** Mirrors the domain page: header, four rings, setup note, then records. */
export function MailDomainSkeleton() {
  return (
    <PageBody>
      <main aria-busy aria-label="Loading domain" className="space-y-5">
        <span className="skeleton block h-3 w-20" />
        <SkeletonHeader action="w-56" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {CHECKS.map((check) => (
            <div
              aria-hidden="true"
              className="surface-card flex items-center gap-4 rounded-card p-4"
              key={check}
            >
              <span className="skeleton size-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <span className="skeleton block h-3.5 w-20" />
                <span className="skeleton block h-2.5 w-28" />
              </div>
            </div>
          ))}
        </div>
        <SkeletonCard className="h-[104px]" />
        <SkeletonCard>
          <SkeletonRows rows={6} />
        </SkeletonCard>
      </main>
    </PageBody>
  );
}
