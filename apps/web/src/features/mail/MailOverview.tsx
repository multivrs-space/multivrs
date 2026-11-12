"use client";

import { Suspense } from "react";
import {
  SkeletonCard,
  SkeletonRows,
} from "@/components/dashboard/SkeletonCard";
import { PageBody } from "@/features/dashboard/components/PageBody";
import { MailComposeHero } from "@/features/mail/overview/MailComposeHero";
import { MailHealthCard } from "@/features/mail/overview/MailHealthCard";
import { MailRecentCard } from "@/features/mail/overview/MailRecentCard";
import { MailSetupCard } from "@/features/mail/overview/MailSetupCard";
import { MailVolumeCard } from "@/features/mail/overview/MailVolumeCard";
import {
  MailOverviewHeader,
  OVERVIEW_SLOTS,
} from "@/features/mail/overview/overview-layout";

/** Mail at a glance: volume, a way to write, recent threads, health, setup. */
export function MailOverview() {
  return (
    <PageBody>
      <MailOverviewHeader />
      <div className="grid gap-3 lg:grid-cols-12">
        <Suspense
          fallback={
            <SkeletonCard className={`h-[268px] ${OVERVIEW_SLOTS.volume}`} />
          }
        >
          <MailVolumeCard className={OVERVIEW_SLOTS.volume} />
        </Suspense>
        <MailComposeHero className={OVERVIEW_SLOTS.hero} />
        <Suspense
          fallback={
            <SkeletonCard className={`min-h-[360px] ${OVERVIEW_SLOTS.recent}`}>
              <SkeletonRows rows={5} />
            </SkeletonCard>
          }
        >
          <MailRecentCard className={OVERVIEW_SLOTS.recent} />
        </Suspense>
        <Suspense
          fallback={
            <SkeletonCard
              className={`min-h-[360px] ${OVERVIEW_SLOTS.health}`}
            />
          }
        >
          <MailHealthCard className={OVERVIEW_SLOTS.health} />
        </Suspense>
        <Suspense
          fallback={
            <SkeletonCard className={`min-h-[360px] ${OVERVIEW_SLOTS.setup}`}>
              <SkeletonRows rows={3} />
            </SkeletonCard>
          }
        >
          <MailSetupCard className={OVERVIEW_SLOTS.setup} />
        </Suspense>
      </div>
    </PageBody>
  );
}
