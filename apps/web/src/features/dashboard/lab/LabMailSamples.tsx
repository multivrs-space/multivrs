"use client";

import type { CSSProperties } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  LAB_ACTIVITY,
  LAB_DNS,
  LAB_MESSAGES,
  LAB_RESOURCES,
  LAB_SHELL,
  LAB_THREADS,
} from "@/features/dashboard/lab/lab-mail-data";
import { MailAnalyticsPage } from "@/features/mail/analytics/MailAnalyticsPage";
import { MailDnsRecordsCard } from "@/features/mail/domain/MailDnsRecordsCard";
import { MailDomainChecks } from "@/features/mail/domain/MailDomainChecks";
import { domainChecks } from "@/features/mail/domain/mail-domain-checks";
import { MailOverview } from "@/features/mail/MailOverview";
import { MailReader } from "@/features/mail/MailReader";
import { MailThreadList } from "@/features/mail/MailThreadList";
import { MailProvider } from "@/features/mail/mail-context";
import { MailResourceList } from "@/features/mail/resources/MailResourceList";

const shell = Promise.resolve(LAB_SHELL);
const resources = Promise.resolve(LAB_RESOURCES);
const activity = Promise.resolve(LAB_ACTIVITY);
const noop = () => undefined;

/** The mail app's screens, fed with lab data so they can be tuned signed out. */
export function LabMailSamples() {
  return (
    <TooltipProvider>
      <MailProvider activity={activity} resources={resources} shell={shell}>
        <div className="space-y-8">
          <MailOverview />
          <MailAnalyticsPage />
          <div
            className="surface-card flex h-[640px] overflow-hidden rounded-card"
            style={{ "--dash-content-h": "640px" } as CSSProperties}
          >
            <MailThreadList
              onRefresh={noop}
              onSelect={noop}
              onToggleStar={noop}
              selectedId="t2"
              threads={LAB_THREADS}
            />
            <MailReader
              currentIndex={1}
              messages={LAB_MESSAGES}
              onAction={noop}
              onForward={noop}
              onReply={noop}
              thread={LAB_THREADS[1]}
              totalThreads={LAB_THREADS.length}
            />
          </div>
          <MailResourceList
            items={LAB_RESOURCES.broadcasts}
            query=""
            view="broadcasts"
          />
          <MailResourceList
            items={LAB_RESOURCES.domains}
            query=""
            view="domains"
          />
          <MailDomainChecks checks={domainChecks(LAB_DNS, "inbound")} />
          <MailDnsRecordsCard
            automatic={false}
            checkedAt="2026-10-27T11:40:00.000Z"
            receivingPurpose="inbound"
            records={LAB_DNS}
          />
        </div>
      </MailProvider>
    </TooltipProvider>
  );
}
