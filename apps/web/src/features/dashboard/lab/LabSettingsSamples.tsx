"use client";

import { LiveUserRound } from "@/components/icons/animated";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AccountActivity } from "@/features/dashboard/components/AccountActivity";
import { AccountInvoicesTab } from "@/features/dashboard/components/account/AccountInvoicesTab";
import { PasskeysCard } from "@/features/dashboard/components/account/auth/PasskeysCard";
import { SessionsCard } from "@/features/dashboard/components/account/auth/SessionsCard";
import { TwoFactorSetup } from "@/features/dashboard/components/account/auth/TwoFactorSetup";
import { DeleteAccountCard } from "@/features/dashboard/components/account/general/DeleteAccountCard";
import { EmailCard } from "@/features/dashboard/components/account/general/EmailCard";
import { TextSettingCard } from "@/features/dashboard/components/settings/TextSettingCard";
import type { DashboardAuditEvent } from "@/lib/services/audit-event.service";

/* Synthetic account for tuning settings visuals in the lab only. */
const at = (hours: number) =>
  new Date(Date.UTC(2026, 9, 27, 12) - hours * 3_600_000).toISOString();
const EVENTS = [
  {
    id: "e1",
    action: "auth.login",
    createdAt: at(1),
    metadata: {},
    projectName: null,
  },
  {
    id: "e2",
    action: "api_token.create",
    createdAt: at(20),
    metadata: { name: "CI" },
    projectName: null,
  },
  {
    id: "e3",
    action: "deployment.create",
    createdAt: at(30),
    metadata: {},
    projectName: "Storefront",
  },
  {
    id: "e4",
    action: "user.2fa_enabled",
    createdAt: at(24 * 40),
    metadata: {},
    projectName: null,
  },
] as unknown as DashboardAuditEvent[];
const INVOICES = [
  {
    id: "i1",
    stripeInvoiceId: "in_1Q7fA2Lk9aZ3",
    amountDueCents: 2000,
    amountPaidCents: 2000,
    amountRemainingCents: 0,
    currency: "usd",
    status: "paid",
    hostedInvoiceUrl: "#",
    createdAt: at(24 * 3),
  },
  {
    id: "i2",
    stripeInvoiceId: "in_1PzQ81Lk9aZ3",
    amountDueCents: 3400,
    amountPaidCents: 0,
    amountRemainingCents: 3400,
    currency: "usd",
    status: "open",
    hostedInvoiceUrl: "#",
    createdAt: at(24 * 33),
  },
];
const SESSIONS = [
  {
    id: "s1",
    token: "t1",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15",
    ipAddress: "102.89.4.12",
    createdAt: at(50),
    lastActiveAt: at(0.1),
    current: true,
  },
  {
    id: "s2",
    token: "t2",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148",
    ipAddress: "102.89.4.40",
    createdAt: at(90),
    lastActiveAt: at(5),
    current: false,
  },
];

/** Settings cards with lab data, so they can be tuned signed out. */
export function LabSettingsSamples() {
  return (
    <TooltipProvider>
      <div className="mx-auto max-w-4xl space-y-3">
        <TextSettingCard
          description="Your full name, or a name you're comfortable with."
          hint="Up to 32 characters."
          icon={LiveUserRound}
          id="lab-name"
          maxLength={32}
          onSave={async () => undefined}
          placeholder="Your name"
          title="Display name"
          value="Ada Obi"
        />
        <EmailCard email="ada@studio.dev" verified />
        <PasskeysCard
          otherMethods={1}
          passkeys={[
            {
              id: "p1",
              name: "MacBook Pro",
              provider: "iCloud Keychain",
              createdAt: at(24 * 12),
            },
          ]}
        />
        <div className="surface-card rounded-card p-5">
          <TwoFactorSetup
            busy={false}
            enrollment={{
              uri: "otpauth://totp/Multivrs:ada%40studio.dev?secret=JBSWY3DPEHPK3PXP&issuer=Multivrs",
              secret: "JBSWY3DPEHPK3PXP",
              backupCodes: ["4f7k-2m9q", "8h3d-1x0p", "7s2a-9c4v", "1n6b-5e8r"],
            }}
            onCancel={() => undefined}
            onVerify={() => undefined}
          />
        </div>
        <SessionsCard sessions={SESSIONS} />
        <AccountActivity events={EVENTS} />
        <AccountInvoicesTab invoices={INVOICES} />
        <DeleteAccountCard
          blockers={[{ message: "Cancel the Pro plan on acme", href: "#" }]}
          email="ada@studio.dev"
          username="ada"
        />
      </div>
    </TooltipProvider>
  );
}
