import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { StatStrip } from "@/components/dashboard/StatStrip";
import { LiveBell } from "@/components/icons/animated";
import { AlertRuleRow } from "@/features/dashboard/components/alerts/AlertRuleRow";
import {
  AlertChannels,
  AlertHistory,
} from "@/features/dashboard/components/alerts/AlertSideCards";
import type {
  AlertChannel,
  AlertFiring,
  AlertRule,
} from "@/features/dashboard/types/alert.types";
/**
 * Alerting across every Observe signal: rules as sentences, what fired and
 * when it cleared, and where notices go.
 */
export function AlertsBoard({
  rules,
  firings,
  channels,
}: {
  rules: AlertRule[];
  firings: AlertFiring[];
  channels: AlertChannel[];
}) {
  const firing = rules.filter((rule) => rule.state === "firing").length;
  return (
    <div className="space-y-3">
      <StatStrip
        stats={[
          {
            label: "Rules",
            value: String(rules.length),
            hint: `${rules.filter((rule) => rule.state === "muted").length} muted`,
          },
          {
            label: "Firing now",
            value: String(firing),
            tone: firing ? "danger" : "default",
            hint: firing ? "Someone's been told" : "All quiet",
          },
          {
            label: "Fired",
            value: String(firings.length),
            hint: "Last 7 days",
          },
          {
            label: "Channels",
            value: String(channels.length),
            hint: "Where notices go",
          },
        ]}
      />
      <div className="grid items-start gap-3 lg:grid-cols-12">
        <DashCard aria-label="Rules" className="lg:col-span-8">
          <DashCardHeader
            description="Across errors, speed, uptime, traffic, usage and logs"
            icon={LiveBell}
            title="Rules"
          />
          <div className="mt-2 divide-y divide-hairline">
            {rules.map((rule) => (
              <AlertRuleRow key={rule.id} rule={rule} />
            ))}
          </div>
        </DashCard>
        <div className="grid content-start gap-3 lg:col-span-4">
          <AlertHistory firings={firings} />
          <AlertChannels channels={channels} />
        </div>
      </div>
    </div>
  );
}
