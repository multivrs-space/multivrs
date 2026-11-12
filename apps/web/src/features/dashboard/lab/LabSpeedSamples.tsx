import { SegmentedGauge } from "@/components/dashboard/charts/SegmentedGauge";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { StatusOrb } from "@/components/dashboard/StatusOrb";
import { LiveGauge, LiveImage, LiveZap } from "@/components/icons/animated";
import { VitalTile } from "@/features/dashboard/components/speed/VitalTile";

/* Sample vitals for the design lab only. */
export function LabSpeedSamples() {
  return (
    <div className="grid gap-3 lg:grid-cols-12">
      <DashCard className="lg:col-span-5">
        <DashCardHeader icon={LiveGauge} title="Experience score" />
        <div className="px-5 py-6">
          <SegmentedGauge caption="Good" label="Experience score" value={82} />
        </div>
      </DashCard>
      <div className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
        <VitalTile
          description="Largest content render"
          icon={LiveImage}
          metric={{ name: "LCP", value: 2140, goodRate: 84, samples: 1820 }}
          name="LCP"
        />
        <VitalTile
          description="Interaction response"
          icon={LiveZap}
          metric={{ name: "INP", value: 310, goodRate: 61, samples: 940 }}
          name="INP"
        />
      </div>
      <div className="flex flex-wrap gap-2 lg:col-span-12">
        <StatusOrb label="Ready" pill tone="ready" />
        <StatusOrb label="Building" pill tone="building" />
        <StatusOrb label="Failed" pill tone="error" />
        <StatusOrb label="Queued" pill tone="queued" />
        <StatusOrb label="No deployments" pill tone="idle" />
      </div>
    </div>
  );
}
