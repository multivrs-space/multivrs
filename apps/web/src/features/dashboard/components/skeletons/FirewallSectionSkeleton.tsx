import {
  SkeletonCard,
  SkeletonHeader,
  SkeletonRows,
} from "@/components/dashboard/SkeletonCard";
import { PageBody } from "@/features/dashboard/components/PageBody";

/** Mirrors the firewall page: sentence composer, then ordered rules. */
export function FirewallSectionSkeleton() {
  return (
    <PageBody>
      <main aria-busy aria-label="Loading firewall" className="space-y-5">
        <SkeletonHeader action="w-40" />
        <SkeletonCard>
          <div className="flex flex-wrap gap-2">
            {["if", "field", "op", "value", "then"].map((key) => (
              <span className="skeleton h-9 w-28 rounded-control" key={key} />
            ))}
          </div>
          <span className="skeleton mt-4 block h-10 w-full rounded-tile" />
        </SkeletonCard>
        <SkeletonCard>
          <SkeletonRows rows={4} />
        </SkeletonCard>
      </main>
    </PageBody>
  );
}
