import { SectionSkeletonHeader } from "./SectionSkeletonParts";

export function IntegrationsSectionSkeleton() {
  return (
    <main className="w-full animate-pulse space-y-6 px-5 py-6" aria-busy>
      <SectionSkeletonHeader titleWidth="w-40" />
      <section className="overflow-hidden rounded-2xl border border-border bg-foreground/2">
        <div className="flex gap-4 border-border border-b p-5">
          <div className="size-10 rounded-xl bg-purple-400/10" />
          <div className="flex-1">
            <div className="h-4 w-36 rounded-sm bg-foreground/8" />
            <div className="mt-3 h-3 max-w-xl rounded-sm bg-foreground/4" />
          </div>
        </div>
        <div className="space-y-5 p-5">
          <div>
            <div className="h-3 w-12 rounded-sm bg-foreground/4" />
            <div className="mt-2 h-10 rounded-lg border border-border bg-muted/50" />
          </div>
          <div>
            <div className="h-3 w-16 rounded-sm bg-foreground/4" />
            <div className="mt-2 h-10 rounded-lg border border-border bg-muted/50" />
          </div>
          <div className="h-10 w-44 rounded-lg bg-muted" />
        </div>
      </section>
    </main>
  );
}
