"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AccountActivity } from "@/features/dashboard/components/AccountActivity";
import { AccountProfileForm } from "@/features/dashboard/components/AccountProfileForm";
import { AccountAuthenticationTab } from "@/features/dashboard/components/account/AccountAuthenticationTab";
import { AccountBillingInformationTab } from "@/features/dashboard/components/account/AccountBillingInformationTab";
import { AccountBillingItemsTab } from "@/features/dashboard/components/account/AccountBillingItemsTab";
import {
  type AccountInviteItem,
  AccountInvitesTab,
} from "@/features/dashboard/components/account/AccountInvitesTab";
import {
  AccountInvoicesTab,
  type InvoiceItem,
} from "@/features/dashboard/components/account/AccountInvoicesTab";
import {
  AccountOverviewTab,
  type AccountTeamOverviewItem,
} from "@/features/dashboard/components/account/AccountOverviewTab";
import { AccountSignInWithMultivrsTab } from "@/features/dashboard/components/account/AccountSignInWithMultivrsTab";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { PageBody } from "@/features/dashboard/components/PageBody";
import type {
  AccountDeletionBlocker,
  AccountSignIn,
} from "@/features/dashboard/types/account-security.types";
import type { AccountProfile } from "@/lib/schemas/account.schemas";
import type { ApiTokenSummary } from "@/lib/services/api-token.service";
import type { DashboardAuditEvent } from "@/lib/services/audit-event.service";

interface SettingsPageProps {
  deletionBlockers: AccountDeletionBlocker[];
  emailVerified?: boolean;
  events: DashboardAuditEvent[];
  invites?: AccountInviteItem[];
  invoices?: InvoiceItem[];
  profile: AccountProfile;
  signIn: AccountSignIn;
  teams?: AccountTeamOverviewItem[];
  tokens: ApiTokenSummary[];
  twoFactorEnabled: boolean;
  userId?: string;
}

const TABS: Record<string, { title: string; description: string }> = {
  settings: {
    title: "Account settings",
    description: "Your profile, your email and the account itself.",
  },
  overview: {
    title: "Your teams",
    description: "Every team this account belongs to.",
  },
  activity: {
    title: "Activity",
    description: "What happened on your account, newest first.",
  },
  invites: { title: "Invites", description: "Teams that asked you to join." },
  authentication: {
    title: "Authentication",
    description: "How you sign in, and what's signed in right now.",
  },
  "sign-in-with-multivrs": {
    title: "Sign in with Multivrs",
    description: "Apps that use your Multivrs account.",
  },
  "billing-information": {
    title: "Billing information",
    description: "The card you pay with and your invoice details.",
  },
  "billing-items": {
    title: "Billing items",
    description: "What each of your teams pays for.",
  },
  invoices: {
    title: "Invoices",
    description: "Every invoice across your billing scopes.",
  },
};

/** Older links pointed straight at these; they now live under Authentication. */
const LEGACY: Record<string, string> = {
  tokens: "authentication",
  sessions: "authentication",
};

function TabContent(props: SettingsPageProps & { tab: string }) {
  const { tab, profile } = props;
  if (tab === "overview") return <AccountOverviewTab teams={props.teams} />;
  if (tab === "invites") return <AccountInvitesTab invites={props.invites} />;
  if (tab === "activity") return <AccountActivity events={props.events} />;
  if (tab === "authentication")
    return (
      <AccountAuthenticationTab
        email={profile.email}
        signIn={props.signIn}
        tokens={props.tokens}
        twoFactorEnabled={props.twoFactorEnabled}
      />
    );
  if (tab === "sign-in-with-multivrs") return <AccountSignInWithMultivrsTab />;
  if (tab === "billing-information") return <AccountBillingInformationTab />;
  if (tab === "billing-items")
    return <AccountBillingItemsTab teams={props.teams} />;
  if (tab === "invoices")
    return <AccountInvoicesTab invoices={props.invoices} />;
  return (
    <AccountProfileForm
      deletionBlockers={props.deletionBlockers}
      emailVerified={props.emailVerified}
      initialProfile={profile}
      userId={props.userId}
    />
  );
}

function Tab(props: SettingsPageProps & { tab: string }) {
  const meta = TABS[props.tab] ?? TABS.settings;
  return (
    <>
      <DashboardPageHeader
        description={meta?.description}
        eyebrow={`${props.profile.username} · Account`}
        title={meta?.title}
      />
      <TabContent {...props} />
    </>
  );
}

function TabFromUrl(props: SettingsPageProps) {
  const requested = useSearchParams().get("tab") ?? "settings";
  const tab = LEGACY[requested] ?? (TABS[requested] ? requested : "settings");
  return <Tab {...props} tab={tab} />;
}

/** Account settings, one tab at a time, chosen by `?tab=` in the URL. */
export function SettingsPage(props: SettingsPageProps) {
  return (
    <PageBody className="max-w-4xl">
      <Suspense fallback={<Tab {...props} tab="settings" />}>
        <TabFromUrl {...props} />
      </Suspense>
    </PageBody>
  );
}
