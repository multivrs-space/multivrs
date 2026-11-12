import { TrafficChart } from "@/components/dashboard/charts/TrafficChart";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import {
  formatCompact,
  formatPercent,
} from "@/components/dashboard/lib/format";
import { SegmentedNav } from "@/components/dashboard/SegmentedNav";
import { StatStrip } from "@/components/dashboard/StatStrip";
import { LiveChartColumn, LivePointerClick } from "@/components/icons/animated";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { ObserveSources } from "@/features/dashboard/components/observe/ObserveSources";
import { PageBody } from "@/features/dashboard/components/PageBody";
import { ProductEventsTable } from "@/features/dashboard/components/product/ProductEventsTable";
import { ProductPlannedCards } from "@/features/dashboard/components/product/ProductPlannedCards";
import { TrackEventCard } from "@/features/dashboard/components/product/TrackEventCard";
import type { ProductAnalytics } from "@/features/dashboard/types/product-analytics.types";

const RANGES = [
  ["24h", "24 hours"],
  ["7d", "7 days"],
  ["30d", "30 days"],
] as const;

/** Product analytics: what people do in the product, from its events. */
export function ProductAnalyticsPage({
  data,
  baseHref,
  scopeName,
  sources,
}: {
  data: ProductAnalytics;
  baseHref: string;
  scopeName: string;
  sources: number;
}) {
  const reach = data.visitors ? (data.users / data.visitors) * 100 : null;
  return (
    <PageBody wide>
      <DashboardPageHeader
        actions={
          <SegmentedNav
            aria-label="Range"
            items={RANGES.map(([value, label]) => ({
              label,
              href: `${baseHref}/product?range=${value}`,
              active: data.range === value,
            }))}
          />
        }
        description="What people do in your product, from the events it sends."
        eyebrow={`${scopeName} · Observe`}
        title="Product Analytics"
      />
      <ObserveSources external="an SDK" projects={sources} />
      {data.state !== "ready" ? (
        <DashCard>
          <EmptyState
            description={
              data.state === "error"
                ? "Events didn't load just now. Nothing is lost; try again in a moment."
                : "Analytics isn't set up in this environment, so there are no events to read."
            }
            glyph={LivePointerClick}
            title={
              data.state === "error"
                ? "Events didn't load"
                : "Events aren't connected here"
            }
          />
        </DashCard>
      ) : data.events === 0 ? (
        <div className="grid gap-3 lg:grid-cols-12">
          <DashCard className="lg:col-span-7">
            <EmptyState
              description="Send an event when someone does something that matters (signs up, upgrades, invites a teammate) and this page fills with who does what."
              glyph={LivePointerClick}
              title="No events yet"
            />
          </DashCard>
          <TrackEventCard className="lg:col-span-5" />
        </div>
      ) : (
        <>
          <StatStrip
            stats={[
              { label: "Events", value: formatCompact(data.events) },
              {
                label: "People",
                value: formatCompact(data.users),
                hint: "Did at least one thing",
              },
              {
                label: "Reach",
                value:
                  reach === null ? "—" : formatPercent(Math.min(reach, 100), 0),
                hint: "Of visitors in the range",
              },
              {
                label: "Per person",
                value: data.users ? (data.events / data.users).toFixed(1) : "—",
                hint: "Events each",
              },
            ]}
          />
          <div className="grid gap-3 lg:grid-cols-12">
            <DashCard aria-label="Events over time" className="lg:col-span-8">
              <DashCardHeader
                description="Every event sent, per period"
                icon={LiveChartColumn}
                title="Activity"
              />
              <TrafficChart
                buckets={data.series.map((point) => ({
                  label: point.label,
                  value: point.events,
                }))}
                className="h-64 px-5 pb-5 pt-4"
                valueLabel="Events"
              />
            </DashCard>
            <TrackEventCard className="lg:col-span-4" />
            <ProductEventsTable
              className="lg:col-span-12"
              rows={data.rows}
              visitors={data.visitors}
            />
          </div>
          <ProductPlannedCards className="grid gap-3 md:grid-cols-2" />
        </>
      )}
    </PageBody>
  );
}
