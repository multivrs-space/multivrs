import { notFound, redirect } from "next/navigation";
import { BackLink } from "@/components/dashboard/BackLink";
import { StatusOrb } from "@/components/dashboard/StatusOrb";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { PageBody } from "@/features/dashboard/components/PageBody";
import { fullTimestamp } from "@/features/dashboard/lib/relative-time";
import { BroadcastActions } from "@/features/mail/broadcast/BroadcastActions";
import { BroadcastContent } from "@/features/mail/broadcast/BroadcastContent";
import { BroadcastLiveRefresh } from "@/features/mail/broadcast/BroadcastLiveRefresh";
import { BroadcastNumbers } from "@/features/mail/broadcast/BroadcastNumbers";
import { broadcastStatus } from "@/features/mail/broadcast/broadcast-status";
import { getServerSession } from "@/lib/auth/session";
import { broadcastDetail } from "@/lib/services/mail-broadcast-detail.service";

export default async function MailBroadcastPage({
  params,
}: {
  params: Promise<{ username: string; scope: string; broadcastId: string }>;
}) {
  const [{ username, scope, broadcastId }, session] = await Promise.all([
    params,
    getServerSession(),
  ]);
  if (!session) redirect("/login");
  const broadcast = await broadcastDetail(session.user.id, broadcastId);
  if (!broadcast) notFound();

  const backHref = `/${username}/${scope}/emails?view=broadcasts`;
  const status = broadcastStatus(broadcast.status);
  const when = broadcast.sentAt ?? broadcast.scheduledAt ?? broadcast.createdAt;
  const whenLabel = broadcast.sentAt
    ? "Sent"
    : broadcast.scheduledAt
      ? "Scheduled for"
      : "Created";

  return (
    <PageBody>
      <BroadcastLiveRefresh
        active={
          status.live &&
          // One scheduled for later doesn't need watching until it's due.
          !(
            broadcast.status === "scheduled" &&
            broadcast.scheduledAt &&
            new Date(broadcast.scheduledAt).getTime() > Date.now() + 60_000
          )
        }
      />
      <BackLink href={backHref} label="Broadcasts" />
      <DashboardPageHeader
        actions={
          <BroadcastActions
            backHref={backHref}
            broadcastId={broadcast.id}
            name={broadcast.name}
            status={broadcast.status}
          />
        }
        eyebrow="Emails · Broadcast"
        title={<span className="break-words">{broadcast.name}</span>}
      >
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
          <StatusOrb label={status.label} pill tone={status.tone} />
          <span className="text-muted-foreground">
            {whenLabel}{" "}
            <time className="text-foreground/80" dateTime={when}>
              {fullTimestamp(when)}
            </time>
          </span>
        </div>
      </DashboardPageHeader>
      {broadcast.error ? (
        <p className="rounded-card border border-rose-500/25 bg-rose-500/5 px-4 py-3 text-[13px] text-rose-700 dark:text-rose-300">
          {broadcast.error}
        </p>
      ) : null}
      {broadcast.status === "draft" ? null : (
        <BroadcastNumbers broadcast={broadcast} />
      )}
      <BroadcastContent broadcast={broadcast} />
    </PageBody>
  );
}
