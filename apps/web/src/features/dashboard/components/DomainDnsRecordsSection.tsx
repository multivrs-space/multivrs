import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { LiveNetwork, LivePlus } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { DnsRecordsTable } from "@/features/dashboard/components/DnsRecordsTable";
import type { DnsRecord, DomainDnsOverview } from "@/lib/domains/dns.types";

interface DomainDnsRecordsSectionProps {
  overview: DomainDnsOverview;
  onAdd(): void;
  onEdit(record: DnsRecord): void;
  onEnable(): void;
  onRemove(record: DnsRecord): void;
}

/** The zone's records, straight from the authoritative DNS. */
export function DomainDnsRecordsSection(props: DomainDnsRecordsSectionProps) {
  const count = props.overview.records.length;
  return (
    <DashCard aria-label="DNS records">
      <DashCardHeader
        action={
          <>
            {props.overview.managed ? null : (
              <Button
                data-icon-trigger
                onClick={props.onEnable}
                size="sm"
                variant="raised"
              >
                Enable Multivrs DNS
              </Button>
            )}
            <Button
              data-icon-trigger
              onClick={props.onAdd}
              size="sm"
              variant="hero"
            >
              <LivePlus strokeWidth={2} />
              Add record
            </Button>
          </>
        }
        description={`${count} authoritative ${count === 1 ? "record" : "records"}`}
        icon={LiveNetwork}
        title="DNS records"
      />
      <DnsRecordsTable
        onEdit={props.onEdit}
        onRemove={props.onRemove}
        records={props.overview.records}
      />
    </DashCard>
  );
}
