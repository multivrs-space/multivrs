import { SkeletonHeader } from "@/components/dashboard/SkeletonCard";
import { PageBody } from "@/features/dashboard/components/PageBody";

const CARDS = ["a", "b", "c", "d"];

/** Stacked settings cards: an icon well and title, a field, a footer strip. */
export function SettingsSectionSkeleton({ account }: { account: boolean }) {
  return (
    <PageBody className="max-w-4xl">
      <main aria-busy aria-label="Loading settings" className="space-y-5">
        <SkeletonHeader />
        {account ? <span className="skeleton block h-2.5 w-20" /> : null}
        <div className="space-y-3">
          {CARDS.map((card, index) => (
            <div
              aria-hidden="true"
              className="surface-card overflow-hidden rounded-card"
              key={card}
            >
              <div className="flex gap-3 p-6">
                <span className="skeleton size-9 shrink-0 rounded-tile" />
                <div className="flex-1 space-y-2.5">
                  <span className="skeleton block h-3.5 w-32" />
                  <span className="skeleton block h-2.5 w-2/3" />
                  {index < 2 ? (
                    <span className="skeleton mt-4 block h-9 max-w-md rounded-control" />
                  ) : null}
                </div>
              </div>
              <div className="h-11 border-t border-hairline bg-foreground/[0.02]" />
            </div>
          ))}
        </div>
      </main>
    </PageBody>
  );
}
