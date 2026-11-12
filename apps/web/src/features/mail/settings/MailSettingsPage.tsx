import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import {
  type AnimatedIcon,
  LiveImage,
  LiveKeyRound,
  LiveLock,
  LiveMailCheck,
  LiveSliders,
  LiveWebhook,
} from "@/components/icons/animated";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { PageBody } from "@/features/dashboard/components/PageBody";

const POLICIES: { icon: AnimatedIcon; label: string; value: string }[] = [
  {
    icon: LiveImage,
    label: "Remote images",
    value: "Hidden in received mail until you load them for a message",
  },
  {
    icon: LiveWebhook,
    label: "Webhook signatures",
    value: "HMAC SHA-256 with a five-minute replay window",
  },
  {
    icon: LiveMailCheck,
    label: "Delivery states",
    value: "Updated only from provider events",
  },
  {
    icon: LiveKeyRound,
    label: "Secrets",
    value: "Hashed at rest and shown once",
  },
];

/** The rules every mailbox follows. Fixed for now, so shown, not edited. */
export function MailSettingsPage() {
  return (
    <PageBody className="max-w-4xl">
      <DashboardPageHeader
        description="How Multivrs treats mail for every mailbox on this account."
        eyebrow="Emails · Communicate"
        title="Mail settings"
      />
      <DashCard aria-label="Mail policy">
        <DashCardHeader
          description="Applied to every mailbox"
          icon={LiveSliders}
          title="Mail policy"
        />
        <ul className="divide-y divide-hairline p-2 pt-3">
          {POLICIES.map(({ icon: Icon, ...policy }) => (
            <li
              className="flex items-center gap-3 rounded-tile px-3 py-3"
              data-icon-trigger
              key={policy.label}
            >
              <span className="surface-inset grid size-9 shrink-0 place-items-center rounded-tile text-muted-foreground">
                <Icon className="size-4" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-medium text-foreground">
                  {policy.label}
                </p>
                <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                  {policy.value}
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-hairline px-2 py-0.5 text-[11px] text-muted-foreground">
                <LiveLock className="size-3" strokeWidth={2} />
                Always on
              </span>
            </li>
          ))}
        </ul>
      </DashCard>
    </PageBody>
  );
}
