"use client";

import { DashCard } from "@/components/dashboard/DashCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LiveNetwork, LiveRefresh } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { PageBody } from "@/features/dashboard/components/PageBody";

export default function DomainDnsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageBody>
      <DashCard>
        <EmptyState
          actions={
            <Button data-icon-trigger onClick={reset} size="sm" variant="hero">
              <LiveRefresh strokeWidth={2} />
              Try again
            </Button>
          }
          description="We couldn't load this domain's DNS zone from the registrar. It's usually temporary."
          glyph={LiveNetwork}
          title="DNS is unavailable right now"
        />
      </DashCard>
    </PageBody>
  );
}
