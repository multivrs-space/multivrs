import { CopyButton } from "@/components/CopyButton";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { StatusOrb } from "@/components/dashboard/StatusOrb";
import { LiveNotebookTabs } from "@/components/icons/animated";
import { LocalTime } from "@/components/LocalTime";
import {
  type DnsRecordRow,
  recordStatus,
} from "@/features/mail/domain/mail-domain-checks";

const GRID =
  "grid-cols-[64px_minmax(200px,1fr)_minmax(280px,1.5fr)_64px_64px_150px]";

function Value({ value }: { value: string }) {
  return (
    <span className="flex min-w-0 items-center gap-1">
      <span
        className="truncate font-geist-mono text-[12px] text-foreground/80"
        title={value}
      >
        {value}
      </span>
      <CopyButton className="size-7 shrink-0" text={value} />
    </span>
  );
}

interface MailDnsRecordsCardProps {
  records: DnsRecordRow[];
  receivingPurpose: string;
  automatic: boolean;
  checkedAt: string | null;
}

/** Every record to publish, each with a copy key and its live status. */
export function MailDnsRecordsCard({
  records,
  receivingPurpose,
  automatic,
  checkedAt,
}: MailDnsRecordsCardProps) {
  return (
    <DashCard aria-label="DNS records">
      <DashCardHeader
        action={
          checkedAt ? (
            <span className="font-geist-mono text-[10.5px] text-muted-foreground">
              Checked <LocalTime value={checkedAt} />
            </span>
          ) : null
        }
        description="Add the MX on the domain itself only if its mail should arrive here."
        icon={LiveNotebookTabs}
        title="DNS records"
      />
      <div className="mt-4 overflow-x-auto">
        <div className="min-w-[960px] px-2 pb-2">
          <div
            className={`grid ${GRID} gap-4 px-3 py-2 font-geist-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground`}
          >
            <span>Type</span>
            <span>Name</span>
            <span>Value</span>
            <span>TTL</span>
            <span>Priority</span>
            <span>Status</span>
          </div>
          <div className="divide-y divide-hairline">
            {records.map((record) => {
              const status = recordStatus(record, receivingPurpose, automatic);
              return (
                <div
                  className={`grid ${GRID} items-center gap-4 rounded-tile px-3 py-3 transition-colors hover:bg-foreground/[0.025]`}
                  key={record.id}
                >
                  <span className="surface-inset w-fit rounded-md px-2 py-0.5 font-geist-mono text-[11px] font-semibold text-foreground/80">
                    {record.type}
                  </span>
                  <Value value={record.name} />
                  <Value value={record.value} />
                  <span className="font-geist-mono text-[12px] text-muted-foreground">
                    {record.ttl}
                  </span>
                  <span className="font-geist-mono text-[12px] text-muted-foreground">
                    {record.priority ?? "—"}
                  </span>
                  <StatusOrb
                    className="w-fit"
                    label={status.label}
                    pill
                    tone={status.tone}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashCard>
  );
}
