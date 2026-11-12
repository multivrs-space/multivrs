import { RankedRows } from "@/components/dashboard/charts/RankedRows";
import { TrafficChart } from "@/components/dashboard/charts/TrafficChart";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { formatCompact } from "@/components/dashboard/lib/format";
import { formatBytes } from "@/components/dashboard/lib/units";
import { Metric } from "@/components/dashboard/Metric";
import {
  type AnimatedIcon,
  LiveEarth,
  LiveListFilter,
} from "@/components/icons/animated";
import { countryName } from "@/features/dashboard/lib/world-map";
import type { PlatformAnalytics } from "@/features/dashboard/types/analytics.types";

interface EdgeSignalViewProps {
  data: PlatformAnalytics;
  /** `requests` charts volume and errors; `transfer` charts bytes served. */
  mode: "requests" | "transfer";
  glyph: AnimatedIcon;
}

/** Edge Requests and Fast Data Transfer, both from live edge analytics. */
export function EdgeSignalView({ data, mode, glyph }: EdgeSignalViewProps) {
  if (data.state !== "ready") {
    return (
      <DashCard>
        <EmptyState
          description="Live edge telemetry isn't available right now. Try again in a moment."
          glyph={glyph}
          title="Edge signals are offline"
        />
      </DashCard>
    );
  }
  const transfer = mode === "transfer";
  const buckets = data.series.map((point) => ({
    label: point.label,
    value: transfer ? point.bandwidthBytes : point.requests,
    rate: transfer
      ? undefined
      : point.requests
        ? (point.errors / point.requests) * 100
        : 0,
  }));
  const kpis = transfer
    ? [
        { label: "Bytes served", value: formatBytes(data.bandwidthBytes) },
        {
          label: "Per request",
          value: data.requests
            ? formatBytes(data.bandwidthBytes / data.requests)
            : "—",
        },
        { label: "Requests", value: formatCompact(data.requests) },
      ]
    : [
        { label: "Requests", value: formatCompact(data.requests) },
        {
          label: "Average latency",
          value: `${Math.round(data.averageLatency)} ms`,
        },
        { label: "Error rate", value: `${data.errorRate.toFixed(2)}%` },
        { label: "Countries", value: String(data.countries.length) },
      ];

  return (
    <div className="grid gap-3 lg:grid-cols-12">
      <DashCard aria-label="Signal over time" className="lg:col-span-12">
        <div className="grid grid-cols-2 gap-6 p-5 md:grid-cols-4">
          {kpis.map((kpi) => (
            <Metric
              key={kpi.label}
              label={kpi.label}
              size="md"
              value={kpi.value}
            />
          ))}
        </div>
        <TrafficChart
          buckets={buckets}
          className="h-64 px-5 pb-5"
          format={transfer ? formatBytes : formatCompact}
          rateLabel={transfer ? undefined : "Error rate"}
          valueLabel={transfer ? "Bytes" : "Requests"}
        />
      </DashCard>
      <DashCard aria-label="Top paths" className="lg:col-span-7">
        <DashCardHeader
          description="Busiest first"
          icon={LiveListFilter}
          title="Top paths"
        />
        <div className="p-5 pt-4">
          <RankedRows
            labelHeading="Path"
            mono
            rows={data.paths.map((item) => ({
              label: item.label,
              value: item.requests,
            }))}
            valueHeading="Requests"
          />
        </div>
      </DashCard>
      <DashCard aria-label="Top countries" className="lg:col-span-5">
        <DashCardHeader
          description="Where requests came from"
          icon={LiveEarth}
          title="Top countries"
        />
        <div className="p-5 pt-4">
          <RankedRows
            labelHeading="Country"
            rows={data.countries.slice(0, 8).map((item) => ({
              label: countryName(item.label),
              value: item.requests,
            }))}
            valueHeading="Requests"
          />
        </div>
      </DashCard>
    </div>
  );
}
