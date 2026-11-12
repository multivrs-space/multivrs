"use client";

import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { DASH_FIELD, DASH_MENU } from "@/components/dashboard/menu";
import {
  type AnimatedIcon,
  LiveActivity,
  LiveGauge,
  LiveNetwork,
  LiveSend,
  LiveSparkles,
  LiveZap,
} from "@/components/icons/animated";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  cacheModeDescription,
  formatTtl,
} from "@/features/dashboard/lib/cdn-settings";
import type {
  CacheMode,
  EdgeSettingsData,
} from "@/features/dashboard/types/edge-settings.types";
import { cn } from "@/lib/utils";

const TTL_OPTIONS = [0, 60, 300, 3600, 86400, 604800, 31536000];
const MODES: { mode: CacheMode; icon: AnimatedIcon }[] = [
  { mode: "smart", icon: LiveSparkles },
  { mode: "aggressive", icon: LiveZap },
  { mode: "bypass", icon: LiveSend },
];

interface SettingsControlProps {
  settings: EdgeSettingsData;
  onChange(settings: EdgeSettingsData): void;
}

/** Cache mode as three choosable tiles, then browser and edge lifetimes. */
export function CacheSettingsCard({
  settings,
  onChange,
}: SettingsControlProps) {
  const setTtl = (key: "browserTtl" | "edgeTtl", value: string) =>
    onChange({ ...settings, [key]: Number(value) });
  return (
    <DashCard aria-label="Cache behaviour">
      <DashCardHeader
        description="Applied by the serving edge on the next request"
        icon={LiveNetwork}
        title="Cache behaviour"
      />
      <div className="grid gap-2 p-5 pt-4 md:grid-cols-3">
        {MODES.map(({ mode, icon: Icon }) => {
          const on = settings.cacheMode === mode;
          return (
            <button
              aria-pressed={on}
              className={cn(
                "surface-press rounded-tile border p-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                on
                  ? "surface-raised border-primary/40"
                  : "border-hairline hover:bg-foreground/[0.025]",
              )}
              data-icon-trigger
              key={mode}
              onClick={() => onChange({ ...settings, cacheMode: mode })}
              type="button"
            >
              <span className="flex items-center gap-2 text-[13.5px] font-medium capitalize">
                <Icon
                  className={cn(
                    "size-4",
                    on ? "text-primary" : "text-muted-foreground",
                  )}
                  strokeWidth={1.75}
                />
                {mode}
              </span>
              <span className="mt-2 block text-xs leading-5 text-muted-foreground">
                {cacheModeDescription(mode)}
              </span>
            </button>
          );
        })}
      </div>
      <div className="grid gap-4 border-t border-hairline p-5 md:grid-cols-2">
        <TtlSelect
          label="Browser TTL"
          onChange={(value) => setTtl("browserTtl", value)}
          value={settings.browserTtl}
        />
        <TtlSelect
          label="Edge TTL"
          onChange={(value) => setTtl("edgeTtl", value)}
          value={settings.edgeTtl}
        />
      </div>
    </DashCard>
  );
}

/** Whether the edge records analytics and Web Vitals for this project. */
export function CdnTelemetryCard({ settings, onChange }: SettingsControlProps) {
  return (
    <DashCard aria-label="Telemetry">
      <DashCardHeader
        description="What the edge measures for you"
        icon={LiveActivity}
        title="Telemetry"
      />
      <div className="divide-y divide-hairline p-2 pt-3">
        <ToggleRow
          checked={settings.analyticsEnabled}
          description="Write request telemetry for Web Analytics and Observability."
          icon={LiveActivity}
          label="Web Analytics"
          onChange={(analyticsEnabled) =>
            onChange({ ...settings, analyticsEnabled })
          }
        />
        <ToggleRow
          checked={settings.speedInsightsEnabled}
          description="Collect latency and Core Web Vitals from real visits."
          icon={LiveGauge}
          label="Speed Insights"
          onChange={(speedInsightsEnabled) =>
            onChange({ ...settings, speedInsightsEnabled })
          }
        />
      </div>
    </DashCard>
  );
}

function TtlSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange(value: string): void;
}) {
  return (
    <div className="space-y-1.5 text-xs font-medium">
      <span>{label}</span>
      <Select onValueChange={onChange} value={String(value)}>
        <SelectTrigger className={`${DASH_FIELD} w-full`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className={DASH_MENU}>
          {TTL_OPTIONS.map((ttl) => (
            <SelectItem key={ttl} value={String(ttl)}>
              {formatTtl(ttl)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ToggleRow(props: {
  label: string;
  description: string;
  icon: AnimatedIcon;
  checked: boolean;
  onChange(value: boolean): void;
}) {
  const Icon = props.icon;
  return (
    <div
      className="flex items-center justify-between gap-6 rounded-tile px-3 py-3"
      data-icon-trigger
    >
      <div className="flex items-start gap-3">
        <Icon
          className="mt-0.5 size-4 text-muted-foreground"
          strokeWidth={1.75}
        />
        <div>
          <p className="text-[13.5px] font-medium">{props.label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {props.description}
          </p>
        </div>
      </div>
      <Switch
        aria-label={props.label}
        checked={props.checked}
        onCheckedChange={props.onChange}
      />
    </div>
  );
}
