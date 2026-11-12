"use client";

import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import { StatusOrb } from "@/components/dashboard/StatusOrb";
import { LiveArrowLeft } from "@/components/icons/animated";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { DomainActions } from "@/features/dashboard/components/DomainActions";
import { DomainMetadataGrid } from "@/features/dashboard/components/DomainMetadataGrid";
import type { DomainDetail } from "@/lib/domains/dns.types";

interface DomainOverviewPanelProps {
  autoRenew: boolean;
  backUrl: string;
  delegated: boolean;
  domain: DomainDetail;
  renewPending: boolean;
  onToggleRenew(): void;
}

/** The domain's name, state and key facts at the top of its page. */
export function DomainOverviewPanel(props: DomainOverviewPanelProps) {
  const { autoRenew, backUrl, delegated, domain, renewPending, onToggleRenew } =
    props;
  const live = domain.verified && domain.certStatus === "active";
  return (
    <>
      <Link
        className="inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
        data-icon-trigger
        href={backUrl}
      >
        <LiveArrowLeft className="size-3.5" strokeWidth={2} />
        Domains
      </Link>
      <DashboardPageHeader
        actions={
          <DomainActions
            detailUrl="#"
            domainId={domain.id}
            hostname={domain.hostname}
            initialAutoRenew={autoRenew}
          />
        }
        description={
          domain.managed
            ? "Registered and managed by Multivrs."
            : "Registered elsewhere; DNS and routing managed here."
        }
        eyebrow="Domain"
        title={
          <span className="flex flex-wrap items-center gap-2.5">
            <span className="font-geist-mono text-[0.85em]">
              {domain.hostname}
            </span>
            <CopyButton className="size-8" text={domain.hostname} />
            <StatusOrb
              label={live ? "Active" : "Pending setup"}
              pill
              tone={live ? "ready" : "building"}
            />
          </span>
        }
      />
      <DomainMetadataGrid
        autoRenew={autoRenew}
        delegated={delegated}
        domain={domain}
        onToggleRenew={onToggleRenew}
        renewPending={renewPending}
      />
    </>
  );
}
