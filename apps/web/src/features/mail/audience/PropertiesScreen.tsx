"use client";

import { Suspense } from "react";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { PageBody } from "@/features/dashboard/components/PageBody";
import { AudienceTabs } from "@/features/mail/audience/AudienceTabs";
import { AUDIENCE_DESCRIPTION } from "@/features/mail/audience/audience-copy";
import { PropertiesList } from "@/features/mail/audience/PropertiesList";
import { MailResourceSkeleton } from "@/features/mail/resources/MailResourceSkeleton";

/** The Properties tab of the Audience page. */
export function PropertiesScreen() {
  return (
    <PageBody>
      <DashboardPageHeader
        description={AUDIENCE_DESCRIPTION}
        eyebrow="Emails · Communicate"
        title="Audience"
      >
        <div className="mt-4">
          <AudienceTabs view="properties" />
        </div>
      </DashboardPageHeader>
      <Suspense fallback={<MailResourceSkeleton layout="rows" />}>
        <PropertiesList />
      </Suspense>
    </PageBody>
  );
}
