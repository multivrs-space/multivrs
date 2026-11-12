"use client";

import Link from "next/link";
import { useState } from "react";
import { DashCard } from "@/components/dashboard/DashCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LiveGlobe, LivePlus } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { ConnectDomainDialog } from "@/features/dashboard/components/ConnectDomainDialog";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { DashboardSearchInput } from "@/features/dashboard/components/DashboardSearchInput";
import { DomainRow } from "@/features/dashboard/components/DomainRow";
import { PageBody } from "@/features/dashboard/components/PageBody";
import type {
  DashboardDomain,
  DomainProjectOption,
} from "@/lib/services/domain.service";

interface DomainsPageProps {
  domains: DashboardDomain[];
  projects: DomainProjectOption[];
  teamSlug: string;
  scope: string;
}

/** Every custom domain in scope: where it points, live or pending, renewals. */
export function DomainsPage({
  domains,
  projects,
  teamSlug,
  scope,
}: DomainsPageProps) {
  const [query, setQuery] = useState("");
  const [connectOpen, setConnectOpen] = useState(false);
  const needle = query.trim().toLowerCase();
  const visible = domains.filter((domain) =>
    domain.name.toLowerCase().includes(needle),
  );
  const marketplace = `/domains?teamSlug=${encodeURIComponent(teamSlug)}&source=team-domains-header-buy`;
  const counts = [
    { label: "Domains", value: domains.length },
    {
      label: "Active",
      value: domains.filter((domain) => domain.status === "Active").length,
    },
    {
      label: "Pending setup",
      value: domains.filter((domain) => domain.status !== "Active").length,
    },
    {
      label: "Bought here",
      value: domains.filter((domain) => domain.managed).length,
    },
  ];

  return (
    <PageBody>
      <DashboardPageHeader
        actions={
          <>
            <Button
              data-icon-trigger
              onClick={() => setConnectOpen(true)}
              size="sm"
              variant="raised"
            >
              <LivePlus strokeWidth={2} />
              Connect domain
            </Button>
            <Link
              className={buttonVariants({ size: "sm", variant: "hero" })}
              data-icon-trigger
              href={marketplace}
            >
              <LiveGlobe strokeWidth={1.75} />
              Buy a domain
            </Link>
          </>
        }
        description="Custom domains, where they point, and their DNS and certificates."
        eyebrow={scope === "~" ? `${teamSlug} · All projects` : scope}
        title="Domains"
      />

      {domains.length ? (
        <>
          <div className="surface-card grid grid-cols-2 gap-px overflow-hidden rounded-card bg-hairline md:grid-cols-4">
            {counts.map((count) => (
              <div className="bg-card p-4" key={count.label}>
                <p className="text-[12px] text-muted-foreground">
                  {count.label}
                </p>
                <p className="figure mt-2 text-[28px] font-semibold leading-none">
                  {count.value}
                </p>
              </div>
            ))}
          </div>
          <DashboardSearchInput
            clearable
            onValueChange={setQuery}
            placeholder="Search domains"
            value={query}
          />
          <DashCard>
            <div className="divide-y divide-hairline p-1.5">
              {visible.map((domain) => (
                <DomainRow
                  detailUrl={`/${teamSlug}/${scope}/domains/${encodeURIComponent(domain.name)}`}
                  domain={domain}
                  key={domain.id}
                />
              ))}
              {visible.length ? null : (
                <p className="py-14 text-center text-[13px] text-muted-foreground">
                  No domains match “{query}”.
                </p>
              )}
            </div>
          </DashCard>
        </>
      ) : (
        <DashCard>
          <EmptyState
            actions={
              <>
                <Button
                  data-icon-trigger
                  onClick={() => setConnectOpen(true)}
                  size="sm"
                  variant="raised"
                >
                  <LivePlus strokeWidth={2} />
                  Connect a domain you own
                </Button>
                <Link
                  className={buttonVariants({ size: "sm", variant: "hero" })}
                  href={marketplace}
                >
                  Buy a domain
                </Link>
              </>
            }
            description="Point a domain you already own at a project, or buy one here and it's set up for you."
            glyph={LiveGlobe}
            title="No domains yet"
          />
        </DashCard>
      )}
      <ConnectDomainDialog
        onOpenChange={setConnectOpen}
        open={connectOpen}
        projects={projects}
      />
    </PageBody>
  );
}
