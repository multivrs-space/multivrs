import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { StatusOrb } from "@/components/dashboard/StatusOrb";
import { LiveArrowLeft, LiveShieldCheck } from "@/components/icons/animated";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { PageBody } from "@/features/dashboard/components/PageBody";
import { MailDnsRecordsCard } from "@/features/mail/domain/MailDnsRecordsCard";
import { MailDomainChecks } from "@/features/mail/domain/MailDomainChecks";
import { MailDomainSetupCard } from "@/features/mail/domain/MailDomainSetupCard";
import {
  domainChecks,
  regionName,
} from "@/features/mail/domain/mail-domain-checks";
import { MailDomainDeleteButton } from "@/features/mail/MailDomainDeleteButton";
import { MailDomainVerifyButton } from "@/features/mail/MailDomainVerifyButton";
import { getServerSession } from "@/lib/auth/session";
import { isAuthenticatedSendingDomain } from "@/lib/mail/mail-domain-dns";
import { RECEIVING_PURPOSE } from "@/lib/mail/ses-domain-snapshot";
import { prisma } from "@/lib/prisma";
import { ownedOrTeamWhere } from "@/lib/services/account-access";
import { mailDomainDnsMode } from "@/lib/services/mail-domain.service";

export default async function MailDomainDnsPage({
  params,
}: {
  params: Promise<{ username: string; scope: string; domainId: string }>;
}) {
  const [{ username, scope, domainId }, session] = await Promise.all([
    params,
    getServerSession(),
  ]);
  if (!session) redirect("/login");

  // Yours, or one on an account whose team you're on.
  const domain = await prisma.mailDomain.findFirst({
    where: { id: domainId, OR: ownedOrTeamWhere(session.user.id) },
    include: { dnsRecords: { orderBy: [{ purpose: "asc" }, { name: "asc" }] } },
  });
  if (!domain) notFound();

  const automatic =
    (await mailDomainDnsMode(domain.userId, domain.domain)) === "automatic";
  const verified = isAuthenticatedSendingDomain(domain);
  const status = verified
    ? "Verified"
    : domain.status === "failed"
      ? "Failed"
      : "Pending";
  const backHref = `/${username}/${scope}/emails?view=domains`;
  const facts = [
    ["Region", regionName(domain.region)],
    ["DNS", automatic ? "Managed by Multivrs" : "Your provider"],
  ];

  return (
    <PageBody>
      <Link
        className="flex w-fit items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        data-icon-trigger
        href={backHref}
      >
        <LiveArrowLeft className="size-3.5" strokeWidth={2} />
        Domains
      </Link>
      <DashboardPageHeader
        actions={
          <>
            <MailDomainDeleteButton
              backHref={backHref}
              domain={domain.domain}
              domainId={domain.id}
            />
            <MailDomainVerifyButton domainId={domain.id} verified={verified} />
          </>
        }
        eyebrow="Emails · Sending domain"
        title={<span className="break-all">{domain.domain}</span>}
      >
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
          <StatusOrb
            label={status}
            pill
            tone={
              verified
                ? "ready"
                : domain.status === "failed"
                  ? "error"
                  : "building"
            }
          />
          {facts.map(([label, value]) => (
            <span className="text-muted-foreground" key={label}>
              {label} <span className="text-foreground/80">{value}</span>
            </span>
          ))}
        </div>
      </DashboardPageHeader>
      <MailDomainChecks
        checks={domainChecks(domain.dnsRecords, RECEIVING_PURPOSE)}
      />
      <MailDomainSetupCard automatic={automatic} />
      <MailDnsRecordsCard
        automatic={automatic}
        checkedAt={domain.verificationCheckedAt?.toISOString() ?? null}
        receivingPurpose={RECEIVING_PURPOSE}
        records={domain.dnsRecords}
      />
      <p
        className="flex items-start gap-2.5 px-1 text-[12.5px] leading-relaxed text-muted-foreground"
        data-icon-trigger
      >
        <LiveShieldCheck
          className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
          strokeWidth={1.75}
        />
        Checks refresh on their own. Mail from this domain stays blocked until
        it's verified, so unsigned mail never hurts its reputation.
      </p>
    </PageBody>
  );
}
