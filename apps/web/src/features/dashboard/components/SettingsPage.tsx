"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AccountActivity } from "@/features/dashboard/components/AccountActivity";
import { AccountProfileForm } from "@/features/dashboard/components/AccountProfileForm";
import { AccountSessions } from "@/features/dashboard/components/AccountSessions";
import { AccountAuthenticationTab } from "@/features/dashboard/components/account/AccountAuthenticationTab";
import { AccountBillingInformationTab } from "@/features/dashboard/components/account/AccountBillingInformationTab";
import { AccountBillingItemsTab } from "@/features/dashboard/components/account/AccountBillingItemsTab";
import {
  AccountInvitesTab,
  type AccountInviteItem,
} from "@/features/dashboard/components/account/AccountInvitesTab";
import {
  AccountInvoicesTab,
  type InvoiceItem,
} from "@/features/dashboard/components/account/AccountInvoicesTab";
import { AccountOverviewTab } from "@/features/dashboard/components/account/AccountOverviewTab";
import { AccountSignInWithMultivrsTab } from "@/features/dashboard/components/account/AccountSignInWithMultivrsTab";
import { ApiTokensPage } from "@/features/dashboard/components/ApiTokensPage";
import {
  SettingsCard,
  SettingsCardBody,
} from "@/features/dashboard/components/settings/SettingsCard";
import type {
  AccountDeletionBlocker,
  AccountSignIn,
} from "@/features/dashboard/types/account-security.types";
import type { BillingOverview } from "@/features/dashboard/types/billing.types";
import type { AccountProfile } from "@/lib/schemas/account.schemas";
import type { ApiTokenSummary } from "@/lib/services/api-token.service";
import type { DashboardAuditEvent } from "@/lib/services/audit-event.service";

interface SettingsPageProps {
  billing?: BillingOverview;
  deletionBlockers: AccountDeletionBlocker[];
  emailVerified?: boolean;
  events: DashboardAuditEvent[];
  invites?: AccountInviteItem[];
  invoices?: InvoiceItem[];
  profile: AccountProfile;
  signIn: AccountSignIn;
  teams?: Array<{
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
    plan?: string;
    status?: string;
    role?: string;
  }>;
  tokens: ApiTokenSummary[];
  twoFactorEnabled: boolean;
  userId?: string;
}

function SettingsTabContent({
  billing,
  deletionBlockers,
  emailVerified,
  events,
  invites,
  invoices,
  profile,
  signIn,
  teams,
  tokens,
  twoFactorEnabled,
  userId,
}: SettingsPageProps) {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "settings";

  if (tab === "overview") {
    return <AccountOverviewTab teams={teams} />;
  }

  if (tab === "invites") {
    return <AccountInvitesTab invites={invites} />;
  }

  if (tab === "activity") {
    return (
      <AccountActivity
        events={events}
        userImage={profile.image}
        userName={profile.name || profile.username}
      />
    );
  }

  if (tab === "authentication") {
    return (
      <AccountAuthenticationTab
        signIn={signIn}
        email={profile.email}
        twoFactorEnabled={twoFactorEnabled}
        tokens={tokens}
      />
    );
  }

  if (tab === "sign-in-with-multivrs") {
    return <AccountSignInWithMultivrsTab />;
  }

  if (tab === "tokens") {
    return (
      <div className="space-y-6">
        <ApiTokensPage initialTokens={tokens} embedded />
      </div>
    );
  }

  if (tab === "sessions") {
    return (
      <div className="space-y-6">
        <AccountSessions sessions={signIn.sessions} />
      </div>
    );
  }

  if (tab === "billing-information") {
    return (
      <AccountBillingInformationTab
        email={profile.email}
        name={profile.name}
        username={profile.username}
      />
    );
  }

  if (tab === "billing-items") {
    return <AccountBillingItemsTab teams={teams} />;
  }

  if (tab === "invoices") {
    return <AccountInvoicesTab invoices={invoices} />;
  }

  // Default: Settings (General)
  return (
    <AccountProfileForm
      emailVerified={emailVerified}
      initialProfile={profile}
      teams={teams}
      userId={userId}
    />
  );
}

export function SettingsPage(props: SettingsPageProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8">
      <Suspense
        fallback={
          <AccountProfileForm
            emailVerified={props.emailVerified}
            initialProfile={props.profile}
            teams={props.teams}
            userId={props.userId}
          />
        }
      >
        <SettingsTabContent {...props} />
      </Suspense>
    </div>
  );
}
