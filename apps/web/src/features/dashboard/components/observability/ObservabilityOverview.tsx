import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { formatCompact } from "@/components/dashboard/lib/format";
import { formatBytes } from "@/components/dashboard/lib/units";
import { StatusOrb } from "@/components/dashboard/StatusOrb";
import {
  LiveGlobe,
  LiveHistory,
  LiveNetwork,
  LiveRadar,
  LiveRocket,
  LiveTriangleAlert,
} from "@/components/icons/animated";
import { SignalCard } from "@/features/dashboard/components/observability/SignalCard";
import {
  fullTimestamp,
  relativeTime,
} from "@/features/dashboard/lib/relative-time";
import type { ObservabilityData } from "@/features/dashboard/types/observability.types";

/** Four live signals, deployment health, and the latest runtime errors. */
export function ObservabilityOverview({
  data,
  base,
}: {
  data: ObservabilityData;
  base: string;
}) {
  const view = (key: string) =>
    `${base}/observability?view=${key}&range=${data.range}`;
  const errorRates = data.series.map((point) =>
    point.requests ? (point.errors / point.requests) * 100 : 0,
  );

  return (
    <>
      {data.state !== "ready" ? (
        <DashCard>
          <EmptyState
            description="Live request telemetry isn't available right now. Deployment health and runtime errors below still are."
            glyph={LiveRadar}
            title="Edge signals are offline"
          />
        </DashCard>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
          <SignalCard
            href={view("edge-requests")}
            icon={LiveGlobe}
            metric="Invocations"
            series={data.series.map((p) => p.requests)}
            title="Edge requests"
            value={formatCompact(data.requests)}
          />
          <SignalCard
            href={view("fast-data-transfer")}
            icon={LiveNetwork}
            metric="Bytes served"
            series={data.series.map((p) => p.bandwidthBytes)}
            title="Data transfer"
            tone="muted"
            value={formatBytes(data.bandwidthBytes)}
          />
          <SignalCard
            href={view("edge-requests")}
            icon={LiveHistory}
            metric="Average duration"
            series={data.series.map((p) => p.latency)}
            title="Latency"
            tone="muted"
            value={`${Math.round(data.averageLatency)} ms`}
          />
          <SignalCard
            href={view("edge-requests")}
            icon={LiveTriangleAlert}
            metric="HTTP 5xx responses"
            series={errorRates}
            title="Error rate"
            tone="muted"
            value={`${data.errorRate.toFixed(2)}%`}
          />
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-12">
        <DashCard aria-label="Deployment health" className="lg:col-span-4">
          <DashCardHeader icon={LiveRocket} title="Deployment health" />
          <dl className="grid grid-cols-2 gap-2 p-5 pt-4">
            {[
              {
                label: "Live or building",
                value: data.activeDeployments,
                tone: "ready" as const,
              },
              {
                label: "Failed",
                value: data.errorDeployments,
                tone: "error" as const,
              },
            ].map((item) => (
              <div
                className="surface-inset rounded-tile p-3.5"
                key={item.label}
              >
                <dt className="flex items-center gap-2 text-[12px] text-muted-foreground">
                  <StatusOrb
                    label={item.label}
                    tone={item.value ? item.tone : "idle"}
                  />
                  {item.label}
                </dt>
                <dd className="figure mt-2 text-[28px] font-semibold leading-none">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </DashCard>
        <DashCard aria-label="Recent runtime errors" className="lg:col-span-8">
          <DashCardHeader
            description="Newest first, across this project's deployments"
            icon={LiveTriangleAlert}
            title="Recent runtime errors"
          />
          {data.recentErrors.length ? (
            <ul className="space-y-0.5 p-2 pt-3">
              {data.recentErrors.map((error) => (
                <li
                  className="grid gap-1 rounded-tile px-3 py-2.5 text-[12.5px] transition-colors hover:bg-foreground/[0.025] md:grid-cols-[8.5rem_minmax(0,1fr)_auto] md:gap-3"
                  key={`${error.deploymentId}-${error.createdAt}`}
                >
                  <span className="truncate font-geist-mono text-[11.5px] text-primary">
                    {error.deploymentId.slice(0, 12)}
                  </span>
                  <span
                    className="truncate font-geist-mono text-[11.5px] text-foreground/90"
                    title={error.message}
                  >
                    {error.message}
                  </span>
                  <time
                    className="font-geist-mono text-[10.5px] text-muted-foreground"
                    dateTime={error.createdAt}
                    title={fullTimestamp(error.createdAt)}
                  >
                    {relativeTime(error.createdAt)}
                  </time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-[13px] text-muted-foreground">
              No runtime errors. Nice.
            </p>
          )}
        </DashCard>
      </div>
    </>
  );
}
