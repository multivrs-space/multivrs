import { type OrbTone, StatusOrb } from "@/components/dashboard/StatusOrb";
import {
  type AnimatedIcon,
  LiveActivity,
  LiveBug,
  LiveChartColumn,
  LiveGauge,
  LiveHeartPulse,
  LiveScrollText,
} from "@/components/icons/animated";
import { relativeTime } from "@/features/dashboard/lib/relative-time";
import type {
  AlertRule,
  AlertSignal,
} from "@/features/dashboard/types/alert.types";

export const SIGNAL_ICON: Record<AlertSignal, AnimatedIcon> = {
  errors: LiveBug,
  latency: LiveGauge,
  uptime: LiveHeartPulse,
  traffic: LiveActivity,
  usage: LiveChartColumn,
  logs: LiveScrollText,
};
const STATE: Record<AlertRule["state"], { tone: OrbTone; label: string }> = {
  ok: { tone: "ready", label: "OK" },
  firing: { tone: "error", label: "Firing" },
  muted: { tone: "idle", label: "Muted" },
};
const Strong = ({ children }: { children: string }) => (
  <span className="font-medium text-foreground">{children}</span>
);

/** One rule, read as a sentence, with who it tells and how it stands. */
export function AlertRuleRow({ rule }: { rule: AlertRule }) {
  const Icon = SIGNAL_ICON[rule.signal];
  const state = STATE[rule.state];
  return (
    <div
      className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5 transition-colors hover:bg-foreground/[0.02]"
      data-icon-trigger
    >
      <span className="surface-inset grid size-9 shrink-0 place-items-center rounded-tile text-muted-foreground">
        <Icon className="size-4" strokeWidth={1.75} />
      </span>
      <p className="min-w-0 flex-1 text-[13px] leading-snug text-muted-foreground">
        When <Strong>{rule.metric}</Strong> is {rule.comparison}{" "}
        <Strong>{rule.threshold}</Strong> for <Strong>{rule.window}</Strong> on{" "}
        <Strong>{rule.scope}</Strong>
      </p>
      <span className="flex shrink-0 gap-1">
        {rule.channels.map((channel) => (
          <span
            className="rounded-full bg-foreground/6 px-2 py-0.5 text-[10.5px] capitalize text-muted-foreground"
            key={channel}
          >
            {channel}
          </span>
        ))}
      </span>
      <span className="w-24 shrink-0 text-right font-geist-mono text-[11px] text-muted-foreground">
        {rule.lastFiredAt ? relativeTime(rule.lastFiredAt) : "Never fired"}
      </span>
      <StatusOrb label={state.label} pill tone={state.tone} />
    </div>
  );
}
