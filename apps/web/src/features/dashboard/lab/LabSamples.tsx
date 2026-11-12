import { Sparkline } from "@/components/dashboard/charts/Sparkline";
import { TrafficChart } from "@/components/dashboard/charts/TrafficChart";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { Metric } from "@/components/dashboard/Metric";
import { LiveUsersRound } from "@/components/icons/animated";

/* Synthetic series for tuning visuals in the lab only. Product pages never
   render made-up numbers. */
const WAVE = [12, 18, 15, 22, 30, 26, 41, 38, 52, 47, 60, 58, 71, 64];
const BUCKETS = WAVE.map((value, index) => ({
  label: `${String(index + 8).padStart(2, "0")}:00`,
  value: value * 37,
  rate: (index % 5) * 0.4 + 0.3,
}));

export function LabSamples() {
  return (
    <div className="grid gap-3 lg:grid-cols-12">
      <DashCard className="lg:col-span-12">
        <DashCardHeader
          icon={LiveUsersRound}
          title="Overview"
          description="Sample figures"
        />
        <div className="grid grid-cols-3 gap-4 p-5">
          <Metric
            delta={6.2}
            label="Unique visitors"
            size="md"
            value="200.9K"
          />
          <Metric delta={-4} label="Page views" size="md" value="74.2K" />
          <Metric
            delta={-1.4}
            deltaUnit="pt"
            invert
            label="Bounce rate"
            size="md"
            value="38%"
          />
        </div>
        <Sparkline className="h-16 w-full" label="Sample trend" values={WAVE} />
      </DashCard>
      <DashCard className="lg:col-span-12">
        <DashCardHeader title="Traffic" />
        <TrafficChart
          buckets={BUCKETS}
          className="h-64 px-5 py-6"
          rateLabel="Error rate"
          valueLabel="Page views"
        />
      </DashCard>
    </div>
  );
}
