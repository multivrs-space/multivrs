import {
  SkeletonCard,
  SkeletonRows,
} from "@/components/dashboard/SkeletonCard";

/** Tiles or rows, matching the view's layout. */
export function MailResourceSkeleton({ layout }: { layout: "cards" | "rows" }) {
  if (layout === "cards") {
    return (
      <div
        aria-busy
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
      >
        {["a", "b", "c"].map((key) => (
          <SkeletonCard className="h-[164px]" key={key} />
        ))}
      </div>
    );
  }
  return (
    <div aria-busy>
      <SkeletonCard icon={false}>
        <SkeletonRows rows={6} />
      </SkeletonCard>
    </div>
  );
}
