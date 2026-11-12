import { ShareColumns } from "@/components/dashboard/charts/ShareColumns";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { formatCompact } from "@/components/dashboard/lib/format";
import { LiveEarth } from "@/components/icons/animated";
import { countryShares } from "@/features/dashboard/lib/analytics-insights";
import type { AnalyticsBreakdownItem } from "@/features/dashboard/types/analytics.types";

/** The leading countries as share columns; the map carries the detail. */
export function AnalyticsCountriesCard({
  countries,
  unit,
  className,
}: {
  countries: AnalyticsBreakdownItem[];
  unit: string;
  className?: string;
}) {
  const total = countries.reduce((sum, item) => sum + item.requests, 0);
  return (
    <DashCard aria-label="Top countries" className={className} tone="glass">
      <DashCardHeader
        description={
          countries.length
            ? `${formatCompact(total)} ${unit} from ${countries.length} ${countries.length === 1 ? "country" : "countries"}`
            : `No ${unit} with a location yet`
        }
        icon={LiveEarth}
        title="Top countries"
      />
      {countries.length ? (
        <div className="p-5 pt-4">
          <ShareColumns columns={countryShares(countries)} />
        </div>
      ) : (
        <p className="p-5 text-[12.5px] text-muted-foreground">
          Countries appear as soon as visits arrive.
        </p>
      )}
    </DashCard>
  );
}
