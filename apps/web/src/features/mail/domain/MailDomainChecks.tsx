import { ProgressRing } from "@/components/dashboard/charts/ProgressRing";
import { StatusOrb } from "@/components/dashboard/StatusOrb";
import {
  checkTone,
  type DomainCheck,
} from "@/features/mail/domain/mail-domain-checks";

const STATE = {
  ready: "Verified",
  building: "Waiting",
  idle: "Off",
  queued: "Queued",
  error: "Failed",
} as const;

/** One ring per job the DNS does: sign, return bounces, set policy, receive. */
export function MailDomainChecks({ checks }: { checks: DomainCheck[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {checks.map((check) => {
        const tone = checkTone(check);
        return (
          <section
            aria-label={check.label}
            className="surface-card flex items-center gap-4 rounded-card p-4"
            key={check.key}
          >
            <ProgressRing
              tone={
                tone === "ready"
                  ? "positive"
                  : tone === "idle"
                    ? "muted"
                    : "primary"
              }
              value={check.total ? check.verified / check.total : 0}
            >
              <span className="figure text-[12px] font-semibold text-foreground">
                {check.verified}/{check.total}
              </span>
            </ProgressRing>
            <div className="min-w-0">
              <p className="text-[14px] font-semibold tracking-[-0.01em] text-foreground">
                {check.label}
              </p>
              <p className="truncate text-[12px] text-muted-foreground">
                {check.detail}
              </p>
              <StatusOrb
                pill
                className="mt-1.5"
                label={check.total ? STATE[tone] : "Not set up"}
                tone={tone}
              />
            </div>
          </section>
        );
      })}
    </div>
  );
}
