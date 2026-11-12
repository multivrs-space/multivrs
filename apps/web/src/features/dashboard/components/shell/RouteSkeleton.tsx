"use client";

import { useSyncExternalStore } from "react";
import {
  SkeletonCard,
  SkeletonHeader,
  SkeletonRows,
} from "@/components/dashboard/SkeletonCard";
import { DashboardSectionSkeleton } from "@/features/dashboard/components/DashboardSectionSkeleton";
import { OverviewPageSkeleton } from "@/features/dashboard/components/overview/OverviewSkeletons";
import { PageBody } from "@/features/dashboard/components/PageBody";
import { DeploymentDetailSkeleton } from "@/features/dashboard/components/skeletons/DeploymentDetailSkeleton";
import { DomainDetailSkeleton } from "@/features/dashboard/components/skeletons/DomainDetailSkeleton";
import { ProjectOverviewSkeleton } from "@/features/dashboard/components/skeletons/ProjectOverviewSkeleton";
import { SettingsSectionSkeleton } from "@/features/dashboard/components/skeletons/SettingsSectionSkeleton";
import { MailDomainSkeleton } from "@/features/mail/domain/MailDomainSkeleton";

const subscribe = () => () => undefined;
const browserPath = () => window.location.pathname;
const serverPath = () => "";

/** A neutral page shape, used on the server where the route isn't known. */
function NeutralSkeleton() {
  return (
    <PageBody>
      <main aria-busy aria-label="Loading" className="space-y-5">
        <SkeletonHeader />
        <div className="grid gap-3 lg:grid-cols-12">
          <SkeletonCard className="h-[192px] lg:col-span-12" />
          <SkeletonCard className="lg:col-span-8 lg:min-h-[372px]">
            <SkeletonRows rows={4} />
          </SkeletonCard>
          <SkeletonCard className="lg:col-span-4 lg:min-h-[372px]" />
        </div>
      </main>
    </PageBody>
  );
}

/**
 * The loading page for whichever route is opening. The server can't know
 * the route in this fallback (it's part of the static shell), so it sends
 * the neutral shape; the browser reads its own address while hydrating and
 * swaps in the matching skeleton long before the page's data arrives.
 */
export function RouteSkeleton() {
  const path = useSyncExternalStore(subscribe, browserPath, serverPath);
  const [, scope, section, kind] = path.split("/").filter(Boolean);
  if (!path) return <NeutralSkeleton />;
  if (path.startsWith("/account/settings"))
    return <SettingsSectionSkeleton account />;
  if (!scope) return <OverviewPageSkeleton />;
  if (scope === "new") return <NeutralSkeleton />;
  if (!section) return <ProjectOverviewSkeleton />;
  if (section === "deployments" && kind) return <DeploymentDetailSkeleton />;
  if (section === "email" && kind === "domains") return <MailDomainSkeleton />;
  if (section === "domains" && kind) return <DomainDetailSkeleton />;
  if (kind) return <NeutralSkeleton />;
  return (
    <DashboardSectionSkeleton
      requestedScope={scope}
      requestedSection={section}
    />
  );
}
