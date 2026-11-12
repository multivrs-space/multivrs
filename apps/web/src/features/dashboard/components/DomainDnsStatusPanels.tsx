import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { StatusOrb } from "@/components/dashboard/StatusOrb";
import {
  LiveFileText,
  LiveLock,
  LiveNetwork,
} from "@/components/icons/animated";
import { DomainVerificationValue } from "@/features/dashboard/components/DomainVerificationValue";
import { formatDomainDate } from "@/features/dashboard/lib/domain-date";
import type { DomainDetail, DomainDnsOverview } from "@/lib/domains/dns.types";

/** Delegation, certificate and registration details below the records. */
export function DomainDnsStatusPanels({
  domain,
  overview,
}: {
  domain: DomainDetail;
  overview: DomainDnsOverview;
}) {
  const nameservers = overview.observedNameservers.length
    ? overview.observedNameservers
    : overview.nameservers;
  const certActive = domain.certStatus === "active";
  return (
    <>
      <div className="grid gap-3 lg:grid-cols-2">
        <DashCard aria-label="Nameservers">
          <DashCardHeader
            description={
              overview.delegated
                ? "Delegation is active"
                : "Not delegated to Multivrs DNS yet"
            }
            icon={LiveNetwork}
            title="Nameservers"
          />
          <ul className="surface-inset m-2 mt-4 divide-y divide-hairline rounded-tile">
            {nameservers.map((nameserver) => (
              <li
                className="px-3 py-2.5 font-geist-mono text-[12px] text-foreground/80"
                key={nameserver}
              >
                {nameserver}
              </li>
            ))}
          </ul>
        </DashCard>
        <DashCard aria-label="TLS certificate">
          <DashCardHeader
            description={
              domain.projectId
                ? "For the connected project"
                : "Connect a project to provision"
            }
            icon={LiveLock}
            title="TLS certificate"
          />
          <div className="p-5 pt-4">
            <StatusOrb
              className="w-fit"
              label={certActive ? "Active" : domain.certStatus}
              pill
              tone={certActive ? "ready" : "building"}
            />
            {!certActive &&
            domain.certVerificationName &&
            domain.certVerificationValue ? (
              <div className="mt-4 grid gap-px overflow-hidden rounded-tile bg-hairline">
                <DomainVerificationValue
                  copy
                  label="Certificate TXT name"
                  value={domain.certVerificationName}
                />
                <DomainVerificationValue
                  copy
                  label="Certificate TXT value"
                  value={domain.certVerificationValue}
                />
              </div>
            ) : null}
          </div>
        </DashCard>
      </div>
      <DashCard aria-label="Registration">
        <DashCardHeader icon={LiveFileText} title="Registration" />
        <dl className="grid gap-4 p-5 pt-4 text-[13px] sm:grid-cols-3">
          {[
            ["Registered on", formatDomainDate(domain.registeredAt)],
            [
              "Expires on",
              domain.expiresAt
                ? formatDomainDate(domain.expiresAt)
                : "Not available",
            ],
            ["Provider reference", domain.providerDomainId ?? "Not available"],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-[11.5px] text-muted-foreground">{label}</dt>
              <dd className="mt-1 font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="px-5 pb-5 text-xs leading-5 text-muted-foreground">
          Registrant contact details stay with the registrar and aren't copied
          into this dashboard.
        </p>
      </DashCard>
    </>
  );
}
