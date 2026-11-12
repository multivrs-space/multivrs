import { DashCard } from "@/components/dashboard/DashCard";
import { emailDocument } from "@/features/mail/reader/email-document";
import { MailEmailFrame } from "@/features/mail/reader/MailEmailFrame";
import type { BroadcastDetail } from "@/lib/services/mail-broadcast-detail.service";

/** The email as written: envelope lines, then the body in a sandboxed frame. */
export function BroadcastContent({
  broadcast,
}: {
  broadcast: BroadcastDetail;
}) {
  const lines = [
    ["From", broadcast.fromAddress],
    ["To", broadcast.segment ? `${broadcast.segment} segment` : "All contacts"],
    ["Subject", broadcast.subject],
  ];
  return (
    <DashCard aria-label="Email content">
      <dl className="divide-y divide-hairline border-b border-hairline text-[13px]">
        {lines.map(([label, value]) => (
          <div className="flex gap-4 px-5 py-2.5" key={label}>
            <dt className="w-16 shrink-0 text-muted-foreground">{label}</dt>
            <dd className="min-w-0 truncate text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="bg-white p-5 text-neutral-900 sm:p-7">
        {broadcast.html ? (
          <MailEmailFrame
            document={emailDocument(
              broadcast.html,
              broadcast.text ?? undefined,
            )}
            title={`Broadcast: ${broadcast.subject}`}
          />
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {broadcast.text}
          </p>
        )}
      </div>
      <p className="border-t border-hairline px-5 py-3 text-[12px] text-muted-foreground">
        Each copy fills in merge tags like {"{{first_name}}"} for its recipient
        and ends with their own unsubscribe link.
      </p>
    </DashCard>
  );
}
