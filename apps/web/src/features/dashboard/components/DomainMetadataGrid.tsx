import type { ReactNode } from "react";
import {
  type AnimatedIcon,
  LiveCalendarDays,
  LiveCreditCard,
  LiveGlobe,
  LiveHistory,
  LiveNetwork,
  LiveRefresh,
  LiveShieldCheck,
} from "@/components/icons/animated";
import { Switch } from "@/components/ui/switch";
import { formatDomainDate } from "@/features/dashboard/lib/domain-date";
import type { DomainDetail } from "@/lib/domains/dns.types";

interface DomainMetadataGridProps {
  autoRenew: boolean;
  delegated: boolean;
  domain: DomainDetail;
  renewPending: boolean;
  onToggleRenew(): void;
}

/** Seven facts about the domain in one strip, auto renewal switchable. */
export function DomainMetadataGrid({
  autoRenew,
  delegated,
  domain,
  renewPending,
  onToggleRenew,
}: DomainMetadataGridProps) {
  const cdnActive =
    Boolean(domain.projectId) &&
    domain.verified &&
    domain.certStatus === "active";
  const items: { label: string; icon: AnimatedIcon; value: ReactNode }[] = [
    {
      label: "Expires",
      icon: LiveCalendarDays,
      value: domain.expiresAt
        ? formatDomainDate(domain.expiresAt)
        : "Not available",
    },
    {
      label: "Renewal price",
      icon: LiveCreditCard,
      value: domain.managed ? "Registrar rate" : "External",
    },
    {
      label: "Registrar",
      icon: LiveGlobe,
      value: domain.managed ? "Multivrs" : "Third party",
    },
    {
      label: "Auto renewal",
      icon: LiveRefresh,
      value: (
        <span className="flex items-center gap-2">
          {autoRenew ? "On" : "Off"}
          <Switch
            aria-label={`Turn auto renewal ${autoRenew ? "off" : "on"} for ${domain.hostname}`}
            checked={autoRenew}
            disabled={!domain.managed || renewPending}
            onCheckedChange={onToggleRenew}
            size="sm"
          />
        </span>
      ),
    },
    {
      label: "Registered",
      icon: LiveHistory,
      value: formatDomainDate(domain.registeredAt),
    },
    {
      label: "Nameservers",
      icon: LiveNetwork,
      value: delegated ? "Multivrs" : "External",
    },
    {
      label: "Multivrs CDN",
      icon: LiveShieldCheck,
      value: cdnActive ? "Active" : "Not connected",
    },
  ];
  return (
    <div className="surface-card overflow-hidden rounded-card">
      <dl className="grid gap-px bg-hairline sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
        {items.map((item) => (
          <div className="bg-card p-4" data-icon-trigger key={item.label}>
            <dt className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
              <item.icon className="size-3.5" strokeWidth={1.75} />
              {item.label}
            </dt>
            <dd className="mt-2 text-[14px] font-medium">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
