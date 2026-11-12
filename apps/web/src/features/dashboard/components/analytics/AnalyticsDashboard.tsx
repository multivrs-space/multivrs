import {
  formatCompact,
  formatPercent,
  percentChange,
  pointChange,
} from "@/components/dashboard/lib/format";
import { LiveShieldAlert, LiveZap } from "@/components/icons/animated";
import { AnalyticsCountriesCard } from "@/features/dashboard/components/analytics/AnalyticsCountriesCard";
import { AnalyticsLiveCard } from "@/features/dashboard/components/analytics/AnalyticsLiveCard";
import { AnalyticsOverviewCard } from "@/features/dashboard/components/analytics/AnalyticsOverviewCard";
import { AnalyticsSparkCard } from "@/features/dashboard/components/analytics/AnalyticsSparkCard";
import { AnalyticsStage } from "@/features/dashboard/components/analytics/AnalyticsStage";
import { AnalyticsTopCard } from "@/features/dashboard/components/analytics/AnalyticsTopCard";
import { AnalyticsTrafficCard } from "@/features/dashboard/components/analytics/AnalyticsTrafficCard";
import { errorRateSeries } from "@/features/dashboard/lib/analytics-insights";
import type {
  AnalyticsAudience,
  PlatformAnalytics,
} from "@/features/dashboard/types/analytics.types";

/**
 * Web Analytics with traffic: the live 3D world under the headline cards,
 * then what people read, how they arrive and what they do.
 */
export function AnalyticsDashboard({
  data,
  audience,
  plusEnabled,
}: {
  data: PlatformAnalytics;
  audience: AnalyticsAudience;
  plusEnabled: boolean;
}) {
  // Visitors by country once the edge records it; requests until then.
  const stage = audience.countries.length
    ? { countries: audience.countries, unit: "visitors" }
    : { countries: data.countries, unit: "requests" };
  const items = stage.countries.map((item) => ({
    code: item.label,
    value: item.requests,
  }));
  return (
    <>
      <AnalyticsStage items={items} unit={stage.unit}>
        <div className="grid gap-3 lg:min-h-[588px] lg:grid-cols-12 lg:grid-rows-[auto_1fr_auto]">
          <AnalyticsOverviewCard className="lg:col-span-5" data={data} />
          <AnalyticsLiveCard
            className="lg:col-span-3 lg:row-start-3 lg:self-end"
            data={data}
            live={audience.live}
          />
          <AnalyticsCountriesCard
            className="lg:col-span-4 lg:col-start-9 lg:row-start-3 lg:self-end"
            countries={stage.countries}
            unit={stage.unit}
          />
        </div>
      </AnalyticsStage>
      <div className="grid gap-3 lg:grid-cols-12">
        <AnalyticsTopCard
          audience={audience}
          className="lg:col-span-7 lg:row-span-2"
          data={data}
          plusEnabled={plusEnabled}
        />
        <AnalyticsTrafficCard className="lg:col-span-5" series={data.series} />
        <div className="grid gap-3 sm:grid-cols-2 lg:col-span-5">
          <AnalyticsSparkCard
            delta={percentChange(data.requests, data.previous?.requests)}
            icon={LiveZap}
            series={data.series.map((point) => point.requests)}
            title="Edge requests"
            value={formatCompact(data.requests)}
          />
          <AnalyticsSparkCard
            delta={pointChange(data.errorRate, data.previous?.errorRate)}
            deltaUnit="pt"
            icon={LiveShieldAlert}
            invert
            series={errorRateSeries(data.series)}
            title="Error rate"
            tone="muted"
            value={formatPercent(data.errorRate, 2)}
          />
        </div>
      </div>
    </>
  );
}
