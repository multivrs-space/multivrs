import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { AnalyticsPoint } from "@/features/dashboard/types/analytics.types";
import type { ProjectOverviewData } from "@/features/dashboard/types/project-overview.types";

const WIDTH = 240;
const HEIGHT = 48;

/** SVG path for request volume; flat line when there is no traffic yet. */
function sparkline(series: AnalyticsPoint[]): { line: string; area: string } {
  const values = series.map((point) => point.requests);
  if (values.length < 2) {
    const flat = `M0 ${HEIGHT - 1} L${WIDTH} ${HEIGHT - 1}`;
    return { line: flat, area: "" };
  }
  const max = Math.max(...values, 1);
  const step = WIDTH / (values.length - 1);
  const points = values.map(
    (value, index) =>
      `${(index * step).toFixed(1)} ${(HEIGHT - 2 - (value / max) * (HEIGHT - 6)).toFixed(1)}`,
  );
  const line = `M${points.join(" L")}`;
  return { line, area: `${line} L${WIDTH} ${HEIGHT} L0 ${HEIGHT} Z` };
}

/** Last 24 hours of traffic at a glance. */
export function ProjectPulseCard({
  base,
  data,
}: {
  base: string;
  data: ProjectOverviewData;
}) {
  const { analytics } = data;
  const { line, area } = sparkline(analytics.series);
  const stats = [
    { label: "Latency", value: `${Math.round(analytics.averageLatency)} ms` },
    { label: "Errors", value: `${analytics.errorRate.toFixed(2)}%` },
    { label: "Visitors", value: analytics.visitors.toLocaleString("en-US") },
  ];
  return (
    <section className="rounded-xl border border-(--hairline) bg-(--ink-raised) p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Pulse</h2>
        <span className="font-mono text-[11px] text-muted-foreground">24h</span>
      </div>
      <p className="mt-4 text-3xl font-semibold tabular-nums tracking-tight">
        {analytics.requests.toLocaleString("en-US")}
        <span className="ml-1.5 text-xs font-normal text-muted-foreground">
          requests
        </span>
      </p>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="mt-3 h-12 w-full text-primary"
        aria-hidden="true"
      >
        {area ? <path d={area} className="fill-primary/10" /> : null}
        <path
          d={line}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-(--hairline) pt-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt className="text-[11px] text-muted-foreground">{stat.label}</dt>
            <dd className="mt-0.5 text-[13px] font-medium tabular-nums">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
      <Link
        href={`${base}/analytics`}
        className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        Open analytics <ArrowUpRight className="size-3" />
      </Link>
    </section>
  );
}
