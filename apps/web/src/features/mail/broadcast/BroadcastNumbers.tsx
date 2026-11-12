import { StatStrip } from "@/components/dashboard/StatStrip";
import type { BroadcastDetail } from "@/lib/services/mail-broadcast-detail.service";

const count = new Intl.NumberFormat("en-US");

function rate(part: number, whole: number) {
  return whole ? `${Math.round((part / whole) * 100)}%` : "—";
}

/** Who it reached and what they did, plus progress while copies go out. */
export function BroadcastNumbers({
  broadcast,
}: {
  broadcast: BroadcastDetail;
}) {
  const { counts, status } = broadcast;
  const preparing =
    status === "processing" || (status === "scheduled" && counts.prepared > 0);
  const progress = counts.recipients
    ? Math.min(counts.prepared / counts.recipients, 1)
    : 0;
  return (
    <div className="space-y-3">
      {preparing ? (
        <div className="surface-card rounded-card p-4">
          <div className="flex items-baseline justify-between text-[13px]">
            <span className="font-medium text-foreground">
              Preparing copies
            </span>
            <span className="font-geist-mono text-[12px] tabular-nums text-muted-foreground">
              {count.format(counts.prepared)} /{" "}
              {count.format(counts.recipients)}
            </span>
          </div>
          <div className="surface-inset mt-3 h-2 overflow-hidden rounded-full">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500"
              style={{ width: `${Math.max(progress * 100, 2)}%` }}
            />
          </div>
        </div>
      ) : null}
      <StatStrip
        stats={[
          { label: "Recipients", value: count.format(counts.recipients) },
          {
            label: "Sent",
            value: count.format(counts.sent),
            hint: rate(counts.sent, counts.recipients),
          },
          {
            label: "Delivered",
            value: count.format(counts.delivered),
            hint: rate(counts.delivered, counts.sent),
          },
          {
            label: "Opened",
            value: count.format(counts.opened),
            hint: rate(counts.opened, counts.delivered),
          },
          {
            label: "Clicked",
            value: count.format(counts.clicked),
            hint: rate(counts.clicked, counts.delivered),
          },
          {
            label: "Bounced or failed",
            value: count.format(counts.bounced + counts.failed),
            tone: counts.bounced + counts.failed ? "warn" : "default",
          },
        ]}
      />
    </div>
  );
}
