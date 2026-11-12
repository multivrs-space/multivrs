import type { OrbTone } from "@/components/dashboard/StatusOrb";

export interface DnsRecordRow {
  id: string;
  purpose: string;
  type: string;
  name: string;
  value: string;
  ttl: string;
  priority: number | null;
  status: string;
  managedByMultivrs: boolean;
}

export interface DomainCheck {
  key: string;
  label: string;
  detail: string;
  verified: number;
  total: number;
  /** Receiving is optional: off is a choice, not a fault. */
  optional: boolean;
}

const GROUPS = [
  {
    key: "dkim",
    label: "DKIM",
    detail: "Signs each message",
    match: (purpose: string) => purpose.startsWith("dkim"),
    optional: false,
  },
  {
    key: "spf",
    label: "Return path",
    detail: "SPF and bounce MX",
    match: (purpose: string) => purpose === "spf" || purpose === "mx",
    optional: false,
  },
  {
    key: "dmarc",
    label: "DMARC",
    detail: "Tells inboxes what to trust",
    match: (purpose: string) => purpose === "dmarc",
    optional: false,
  },
] as const;

/** The domain's DNS as a few checks, each counting its verified records. */
export function domainChecks(
  records: readonly DnsRecordRow[],
  receivingPurpose: string,
): DomainCheck[] {
  const count = (match: (purpose: string) => boolean) => {
    const group = records.filter((record) => match(record.purpose));
    return {
      verified: group.filter((record) => record.status === "verified").length,
      total: group.length,
    };
  };
  return [
    ...GROUPS.map(({ match, ...group }) => ({ ...group, ...count(match) })),
    {
      key: "receiving",
      label: "Receiving",
      detail: "Mail into Multivrs",
      optional: true,
      ...count((purpose) => purpose === receivingPurpose),
    },
  ];
}

export function checkTone(check: DomainCheck): OrbTone {
  if (check.total === 0) return "idle";
  if (check.verified === check.total) return "ready";
  return check.optional ? "idle" : "building";
}

type RecordLabel = { label: string; tone: OrbTone };

/** Labels for stored statuses; "pending" and "failed" come from older checks. */
const RECORD_STATUS: Record<string, RecordLabel> = {
  verified: { label: "Verified", tone: "ready" },
  found: { label: "Found, verifying", tone: "building" },
  missing: { label: "Not found", tone: "error" },
  pending: { label: "Pending", tone: "building" },
  failed: { label: "Failed", tone: "error" },
};

/** A record's status in words; a missing receiving MX is optional, not an error. */
export function recordStatus(
  record: DnsRecordRow,
  receivingPurpose: string,
  automatic: boolean,
): RecordLabel {
  const base =
    record.purpose === receivingPurpose && record.status !== "verified"
      ? { label: "Add to receive", tone: "idle" as const }
      : (RECORD_STATUS[record.status] ?? {
          label: "Pending",
          tone: "building" as const,
        });
  if (automatic && record.managedByMultivrs && base.tone !== "ready")
    return { label: "Managed", tone: "queued" };
  return base;
}

const REGIONS: Record<string, string> = {
  "ap-northeast-1": "Tokyo",
  "eu-west-1": "Ireland",
  "sa-east-1": "São Paulo",
  "us-east-1": "N. Virginia",
};

export function regionName(region: string): string {
  return REGIONS[region] ?? region;
}
