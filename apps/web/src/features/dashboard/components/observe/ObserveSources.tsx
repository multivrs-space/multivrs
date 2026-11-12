import { LiveCloud, LiveLayoutGrid } from "@/components/icons/animated";

/**
 * Where an Observe page's data comes from. Multivrs projects feed it with
 * no setup; apps hosted anywhere else connect the way the product suits
 * (a script, an SDK, OpenTelemetry, a URL), which isn't live yet.
 */
export function ObserveSources({
  projects,
  external,
}: {
  /** Multivrs projects feeding this page. */
  projects: number;
  /** How an app hosted elsewhere will connect, e.g. "a script tag". */
  external: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-[12px]">
      <span className="font-geist-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
        Sources
      </span>
      <span
        className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-emerald-700 dark:text-emerald-300"
        data-icon-trigger
      >
        <LiveLayoutGrid className="size-3.5" strokeWidth={1.75} />
        {projects} Multivrs {projects === 1 ? "project" : "projects"} ·
        automatic
      </span>
      <span
        className="flex items-center gap-1.5 rounded-full border border-dashed border-hairline-strong px-2.5 py-1 text-muted-foreground"
        data-icon-trigger
      >
        <LiveCloud className="size-3.5" strokeWidth={1.75} />
        Apps hosted anywhere, via {external} · coming soon
      </span>
    </div>
  );
}
