"use client";

import Link from "next/link";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LiveRefresh, LiveTriangleAlert } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <main className="dashboard-surface grid min-h-[70svh] place-items-center bg-ink px-6">
      <EmptyState
        actions={
          <>
            <Button data-icon-trigger onClick={reset} size="sm" variant="hero">
              <LiveRefresh strokeWidth={2} />
              Try again
            </Button>
            <Link
              className={buttonVariants({ size: "sm", variant: "raised" })}
              href="/dashboard"
            >
              Back to dashboard
            </Link>
          </>
        }
        description="Something went wrong while loading this view. Your projects and data are fine; trying again usually fixes it."
        glyph={LiveTriangleAlert}
        title="This view didn't load"
      />
    </main>
  );
}
