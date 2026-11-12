import { type CardTab, CardTabs } from "@/components/dashboard/CardTabs";
import { RankedRows } from "@/components/dashboard/charts/RankedRows";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { LiveListFilter } from "@/components/icons/animated";
import type {
  AnalyticsAudience,
  PlatformAnalytics,
} from "@/features/dashboard/types/analytics.types";

interface AnalyticsTopCardProps {
  data: PlatformAnalytics;
  audience: AnalyticsAudience;
  plusEnabled: boolean;
  className?: string;
}

function panel(
  items: { label: string; requests: number }[],
  labelHeading: string,
  valueHeading: string,
  mono: boolean,
  empty: string,
) {
  return items.length ? (
    <RankedRows
      labelHeading={labelHeading}
      mono={mono}
      rows={items.map((item) => ({ label: item.label, value: item.requests }))}
      valueHeading={valueHeading}
    />
  ) : (
    <p className="py-10 text-center text-sm text-muted-foreground">{empty}</p>
  );
}

/** What people look at, how they arrive, on what, and what they do. */
export function AnalyticsTopCard({
  data,
  audience,
  plusEnabled,
  className,
}: AnalyticsTopCardProps) {
  const tabs: CardTab[] = [
    {
      id: "pages",
      label: "Pages",
      content: panel(
        data.paths,
        "Path",
        "Requests",
        true,
        "No page requests yet.",
      ),
    },
    {
      id: "referrers",
      label: "Referrers",
      content: panel(
        data.referrers,
        "Referrer",
        "Views",
        true,
        "No referrers recorded yet.",
      ),
    },
    {
      id: "devices",
      label: "Devices",
      content: panel(
        data.devices,
        "Device",
        "Views",
        false,
        "No device data yet.",
      ),
    },
  ];
  tabs.push(
    {
      id: "browsers",
      label: "Browsers",
      content: panel(
        audience.browsers,
        "Browser",
        "Visitors",
        false,
        "No browser data yet.",
      ),
    },
    {
      id: "events",
      label: "Events",
      content: panel(
        audience.events,
        "Event",
        "Count",
        true,
        "No events yet. Call track() from @multivrs/analytics on clicks, sign-ups and purchases.",
      ),
    },
  );
  if (plusEnabled) {
    tabs.splice(2, 0, {
      id: "sources",
      label: "UTM sources",
      content: panel(
        data.sources,
        "Source",
        "Views",
        false,
        "No tagged campaigns yet.",
      ),
    });
  }

  return (
    <DashCard aria-label="Top pages and sources" className={className}>
      <DashCardHeader
        description="Ranked for the selected range"
        icon={LiveListFilter}
        title="Breakdown"
      />
      <div className="p-5 pt-4">
        <CardTabs aria-label="Breakdown" tabs={tabs} />
      </div>
    </DashCard>
  );
}
