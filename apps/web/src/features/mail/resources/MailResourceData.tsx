"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { MailBroadcastCompose } from "@/features/mail/MailBroadcastCompose";
import { MailCreateDialog } from "@/features/mail/MailCreateDialog";
import { useMailData, useMailResources } from "@/features/mail/mail-context";
import { useMailLog } from "@/features/mail/mail-data.client";
import { MailResourceList } from "@/features/mail/resources/MailResourceList";
import { MailResourceSkeleton } from "@/features/mail/resources/MailResourceSkeleton";
import type { MailResourceView } from "@/features/mail/resources/mail-resource-views";
import { resourceItems } from "@/features/mail/resources/resource-items";

/** A resource view's list once the account's resources arrive. */
export function ResourceData({
  view,
  query,
  emptyAction,
}: {
  view: MailResourceView;
  query: string;
  emptyAction: ReactNode;
}) {
  const items = resourceItems(view, useMailData(), useMailResources());
  return (
    <MailResourceList
      emptyAction={emptyAction}
      items={items}
      query={query}
      view={view}
    />
  );
}

/** The create dialog, or the campaign sheet for broadcasts. */
export function CreateFlow({
  view,
  projectId,
  onOpenChange,
}: {
  view: Parameters<typeof MailCreateDialog>[0]["view"];
  projectId?: string;
  onOpenChange: (open: boolean) => void;
}) {
  const resources = useMailResources();
  if (view === "broadcasts")
    return (
      <MailBroadcastCompose
        onOpenChange={onOpenChange}
        open
        projectId={projectId}
        resources={resources}
      />
    );
  return (
    <MailCreateDialog
      onOpenChange={onOpenChange}
      open
      projectId={projectId}
      resources={resources}
      view={view}
    />
  );
}

/** The email log, newest first, a page at a time. */
export function MailLogList({ query }: { query: string }) {
  const log = useMailLog();
  if (log.loading) return <MailResourceSkeleton layout="rows" />;
  const footer = log.hasMore ? (
    <Button
      className="w-full"
      disabled={log.loadingMore}
      onClick={log.loadMore}
      variant="raised"
    >
      {log.loadingMore ? "Loading…" : "Load older messages"}
    </Button>
  ) : null;
  return (
    <MailResourceList
      footer={footer}
      items={log.items}
      query={query}
      view="logs"
    />
  );
}
