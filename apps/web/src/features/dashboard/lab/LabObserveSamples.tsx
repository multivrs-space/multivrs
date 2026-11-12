import { AlertsBoard } from "@/features/dashboard/components/alerts/AlertsBoard";
import { ErrorsPage } from "@/features/dashboard/components/errors/ErrorsPage";
import { ProductAnalyticsPage } from "@/features/dashboard/components/product/ProductAnalyticsPage";
import { TracesBoard } from "@/features/dashboard/components/traces/TracesBoard";
import { UptimeBoard } from "@/features/dashboard/components/uptime/UptimeBoard";
import {
  LAB_CHANNELS,
  LAB_FIRINGS,
  LAB_RULES,
} from "@/features/dashboard/lab/lab-alerts-data";
import {
  LAB_ISSUES,
  LAB_OBSERVE_PROJECTS,
  LAB_PRODUCT,
} from "@/features/dashboard/lab/lab-observe-data";
import { LAB_TRACES } from "@/features/dashboard/lab/lab-traces-data";
import {
  LAB_INCIDENTS,
  LAB_MONITORS,
  LAB_REGIONS,
} from "@/features/dashboard/lab/lab-uptime-data";

const Title = ({ children }: { children: string }) => (
  <h3 className="pt-6 font-geist-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
    {children}
  </h3>
);

/** Every Observe product's design, on lab data, so each can be reviewed signed out. */
export function LabObserveSamples() {
  return (
    <div className="space-y-3">
      <Title>Errors</Title>
      <ErrorsPage
        events={98}
        issues={LAB_ISSUES}
        projects={LAB_OBSERVE_PROJECTS}
        scopeName="acme"
        truncated={false}
        workspace
      />
      <Title>Product Analytics</Title>
      <ProductAnalyticsPage
        baseHref="/acme/~"
        data={LAB_PRODUCT}
        scopeName="acme"
        sources={2}
      />
      <Title>Uptime</Title>
      <UptimeBoard
        incidents={LAB_INCIDENTS}
        monitors={LAB_MONITORS}
        regions={LAB_REGIONS}
      />
      <Title>Alerts</Title>
      <AlertsBoard
        channels={LAB_CHANNELS}
        firings={LAB_FIRINGS}
        rules={LAB_RULES}
      />
      <Title>Traces (inside Monitoring)</Title>
      <TracesBoard traces={LAB_TRACES} />
    </div>
  );
}
