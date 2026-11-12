"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  SkeletonCard,
  SkeletonHeader,
  SkeletonRows,
} from "@/components/dashboard/SkeletonCard";
import { PageBody } from "@/features/dashboard/components/PageBody";
import { MailAnalyticsSkeleton } from "@/features/mail/analytics/MailAnalyticsSkeleton";
import { MailThreadListSkeleton } from "@/features/mail/MailSkeletons";
import { type MailView, parseMailView } from "@/features/mail/mail-view";
import {
  MailOverviewHeader,
  OVERVIEW_SLOTS,
} from "@/features/mail/overview/overview-layout";
import { MailResourceSkeleton } from "@/features/mail/resources/MailResourceSkeleton";
import {
  type MailResourceView,
  mailResourceView,
} from "@/features/mail/resources/mail-resource-views";

const FOLDER_VIEWS = new Set<MailView>([
  "inbox",
  "starred",
  "sent",
  "drafts",
  "archive",
  "spam",
  "trash",
]);

/** The loading state for one mail view, shaped like that view. */
export function MailViewSkeleton({ view }: { view: MailView }) {
  if (FOLDER_VIEWS.has(view)) return <MailThreadListSkeleton view={view} />;
  if (view === "overview") {
    return (
      <PageBody>
        <MailOverviewHeader />
        <div aria-busy className="grid gap-3 lg:grid-cols-12">
          <SkeletonCard className={`h-[268px] ${OVERVIEW_SLOTS.volume}`} />
          <SkeletonCard className={`h-[268px] ${OVERVIEW_SLOTS.hero}`} />
          <SkeletonCard className={`min-h-[360px] ${OVERVIEW_SLOTS.recent}`}>
            <SkeletonRows rows={5} />
          </SkeletonCard>
          <SkeletonCard className={`min-h-[360px] ${OVERVIEW_SLOTS.health}`} />
          <SkeletonCard className={`min-h-[360px] ${OVERVIEW_SLOTS.setup}`}>
            <SkeletonRows rows={3} />
          </SkeletonCard>
        </div>
      </PageBody>
    );
  }
  return (
    <PageBody>
      <SkeletonHeader
        action={
          view === "logs" || view === "analytics" || view === "settings"
            ? undefined
            : "w-36"
        }
      />
      {view === "analytics" ? (
        <MailAnalyticsSkeleton />
      ) : view === "settings" ? (
        <SkeletonCard>
          <SkeletonRows rows={3} />
        </SkeletonCard>
      ) : (
        <MailResourceSkeleton
          layout={mailResourceView(view as MailResourceView).layout}
        />
      )}
    </PageBody>
  );
}

/**
 * The mail page's loading state. Pass the view when it's known; otherwise it
 * is read from `?view=` in the URL.
 */
export function MailPageSkeleton({ view }: { view?: MailView }) {
  if (view) return <MailViewSkeleton view={view} />;
  return (
    <Suspense fallback={<MailViewSkeleton view="overview" />}>
      <ViewFromUrl />
    </Suspense>
  );
}

function ViewFromUrl() {
  return (
    <MailViewSkeleton
      view={parseMailView(useSearchParams().get("view") ?? undefined)}
    />
  );
}
