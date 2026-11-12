import { RankedRows } from "@/components/dashboard/charts/RankedRows";
import { SegmentedGauge } from "@/components/dashboard/charts/SegmentedGauge";
import {
  DashCard,
  DashCardHeader,
  DashCardInsight,
} from "@/components/dashboard/DashCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { SegmentedNav } from "@/components/dashboard/SegmentedNav";
import {
  LiveGauge,
  LiveHistory,
  LiveImage,
  LiveLayoutGrid,
  LiveSparkles,
  LiveZap,
} from "@/components/icons/animated";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { PageBody } from "@/features/dashboard/components/PageBody";
import { VitalRoutesCard } from "@/features/dashboard/components/speed/VitalRoutesCard";
import { VitalTile } from "@/features/dashboard/components/speed/VitalTile";
import {
  experienceScore,
  scoreVerdict,
  type VitalName,
} from "@/features/dashboard/lib/web-vitals";
import type { WebVitalsData } from "@/features/dashboard/types/analytics.types";

const VITALS: {
  name: VitalName;
  description: string;
  icon: typeof LiveImage;
}[] = [
  { name: "LCP", description: "Largest content render", icon: LiveImage },
  { name: "INP", description: "Interaction response", icon: LiveZap },
  { name: "CLS", description: "Visual stability", icon: LiveLayoutGrid },
  { name: "TTFB", description: "First server byte", icon: LiveHistory },
];

const UNAVAILABLE: Record<
  Exclude<WebVitalsData["state"], "ready">,
  { title: string; description: string }
> = {
  locked: {
    title: "Speed Insights is off for this project",
    description:
      "Turn on Speed Insights in team billing to collect Core Web Vitals from real visits.",
  },
  error: {
    title: "Web Vitals didn't load",
    description:
      "Speed Insights didn't answer this time. Try again in a moment.",
  },
  unconfigured: {
    title: "Speed Insights isn't connected here",
    description:
      "Speed Insights isn't set up in this environment, so there are no vitals to read yet.",
  },
};

/** How fast the site feels to real visitors, scored and broken down. */
export function SpeedInsightsPage({
  projectName,
  vitals,
}: {
  projectName: string;
  vitals: WebVitalsData;
}) {
  const score = experienceScore(vitals.metrics);
  const weakest = vitals.metrics
    .filter((metric) => metric.name !== "TTFB")
    .sort((left, right) => left.goodRate - right.goodRate)[0];

  return (
    <PageBody>
      <DashboardPageHeader
        actions={
          <SegmentedNav
            aria-label="Time range"
            items={(["24h", "7d", "30d"] as const).map((range) => ({
              label: range,
              href: `?range=${range}`,
              active: vitals.range === range,
            }))}
          />
        }
        description="Core Web Vitals measured from real visits, not lab tests."
        eyebrow={`${projectName} · Speed Insights`}
        title="Real experience"
      />

      {vitals.state !== "ready" ? (
        <DashCard>
          <EmptyState
            description={UNAVAILABLE[vitals.state].description}
            glyph={LiveGauge}
            title={UNAVAILABLE[vitals.state].title}
          />
        </DashCard>
      ) : (
        <div className="grid gap-3 lg:grid-cols-12">
          <DashCard aria-label="Experience score" className="lg:col-span-5">
            <DashCardHeader
              description="Share of visits with good vitals"
              icon={LiveGauge}
              title="Experience score"
            />
            <div className="flex flex-1 items-center px-5 pb-2 pt-6">
              <SegmentedGauge
                caption={
                  score === null ? "Waiting for visits" : scoreVerdict(score)
                }
                label="Experience score"
                value={score}
              />
            </div>
            {weakest ? (
              <DashCardInsight icon={LiveSparkles} label="Reading">
                {weakest.name} has the lowest share of good visits (
                {Math.round(weakest.goodRate)}%); improving it moves the score
                most.
              </DashCardInsight>
            ) : (
              <div className="h-4" />
            )}
          </DashCard>
          <div className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
            {VITALS.map((vital) => (
              <VitalTile
                description={vital.description}
                icon={vital.icon}
                key={vital.name}
                metric={vitals.metrics.find(
                  (metric) => metric.name === vital.name,
                )}
                name={vital.name}
              />
            ))}
          </div>
          <VitalRoutesCard className="lg:col-span-8" routes={vitals.routes} />
          <DashCard aria-label="Devices" className="lg:col-span-4">
            <DashCardHeader
              description="Where measurements came from"
              icon={LiveLayoutGrid}
              title="Devices"
            />
            <div className="p-5 pt-4">
              {vitals.devices.length ? (
                <RankedRows
                  labelHeading="Device"
                  rows={vitals.devices.map((device) => ({
                    label: device.label,
                    value: device.requests,
                  }))}
                  valueHeading="Samples"
                />
              ) : (
                <p className="py-8 text-center text-[13px] text-muted-foreground">
                  No device data yet.
                </p>
              )}
            </div>
          </DashCard>
        </div>
      )}

      <p className="px-1 text-xs leading-5 text-muted-foreground">
        Multivrs adds a small first-party measurement script to served HTML. No
        third-party scripts and no sample data.
      </p>
    </PageBody>
  );
}
