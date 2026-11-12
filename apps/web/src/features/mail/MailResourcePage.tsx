"use client";

import { Suspense, useState } from "react";
import { LivePlus } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { PageBody } from "@/features/dashboard/components/PageBody";
import { MailAnalyticsPage } from "@/features/mail/analytics/MailAnalyticsPage";
import { AudienceStats } from "@/features/mail/audience/AudienceStats";
import {
  AUDIENCE_VIEWS,
  AudienceTabs,
} from "@/features/mail/audience/AudienceTabs";
import { AUDIENCE_DESCRIPTION } from "@/features/mail/audience/audience-copy";
import { PropertiesScreen } from "@/features/mail/audience/PropertiesScreen";
import { ContactImportButton } from "@/features/mail/contacts/ContactImportButton";
import type { MailView } from "@/features/mail/mail-navigation";
import {
  createMailLabel,
  isCreateMailView,
} from "@/features/mail/mail-resource-form";
import {
  CreateFlow,
  MailLogList,
  ResourceData,
} from "@/features/mail/resources/MailResourceData";
import { MailResourceSkeleton } from "@/features/mail/resources/MailResourceSkeleton";
import {
  type MailResourceView,
  mailResourceView,
} from "@/features/mail/resources/mail-resource-views";
import { MailSettingsPage } from "@/features/mail/settings/MailSettingsPage";

export function MailResourcePage({
  projectId,
  query,
  view,
}: {
  projectId?: string;
  query: string;
  view: MailView;
}) {
  if (view === "settings") return <MailSettingsPage />;
  if (view === "analytics") return <MailAnalyticsPage />;
  if (view === "properties") return <PropertiesScreen />;
  const config = mailResourceView(view as MailResourceView);
  return (
    <ResourceScreen
      config={config}
      projectId={projectId}
      query={query}
      view={view as MailResourceView}
    />
  );
}

function ResourceScreen({
  config,
  projectId,
  query,
  view,
}: {
  config: ReturnType<typeof mailResourceView>;
  projectId?: string;
  query: string;
  view: MailResourceView;
}) {
  const audience = AUDIENCE_VIEWS.includes(view);
  const [creating, setCreating] = useState(false);
  const [session, setSession] = useState(0);
  const create = isCreateMailView(view)
    ? () => {
        setSession((value) => value + 1);
        setCreating(true);
      }
    : undefined;
  const newButton =
    create && isCreateMailView(view) ? (
      <Button data-icon-trigger onClick={create} size="sm" variant="hero">
        <LivePlus strokeWidth={2} />
        New {createMailLabel(view).toLowerCase()}
      </Button>
    ) : null;
  const createButton =
    view === "contacts" ? (
      <div className="flex flex-wrap items-center gap-2">
        <ContactImportButton />
        {newButton}
      </div>
    ) : (
      newButton
    );
  return (
    <PageBody>
      <DashboardPageHeader
        actions={createButton}
        description={audience ? AUDIENCE_DESCRIPTION : config.description}
        eyebrow="Emails · Communicate"
        title={audience ? "Audience" : config.title}
      >
        {audience ? (
          <div className="mt-4">
            <AudienceTabs view={view} />
          </div>
        ) : null}
      </DashboardPageHeader>
      {view === "logs" ? (
        <MailLogList query={query} />
      ) : (
        <Suspense fallback={<MailResourceSkeleton layout={config.layout} />}>
          {view === "contacts" ? <AudienceStats /> : null}
          <ResourceData emptyAction={createButton} query={query} view={view} />
          {creating && isCreateMailView(view) ? (
            <CreateFlow
              key={`${view}-${session}`}
              onOpenChange={setCreating}
              projectId={projectId}
              view={view}
            />
          ) : null}
        </Suspense>
      )}
    </PageBody>
  );
}
