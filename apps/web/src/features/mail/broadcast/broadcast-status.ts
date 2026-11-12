import type { OrbTone } from "@/components/dashboard/StatusOrb";

/** What each stage of a broadcast reads as, and whether it's still moving. */
const STATUSES: Record<
  string,
  { label: string; tone: OrbTone; live: boolean }
> = {
  draft: { label: "Draft", tone: "idle", live: false },
  scheduled: { label: "Scheduled", tone: "queued", live: true },
  processing: { label: "Preparing", tone: "building", live: true },
  sending: { label: "Sending", tone: "building", live: true },
  sent: { label: "Sent", tone: "ready", live: false },
  failed: { label: "Failed", tone: "error", live: false },
};

export function broadcastStatus(status: string) {
  return (
    STATUSES[status] ?? { label: status, tone: "idle" as OrbTone, live: false }
  );
}
