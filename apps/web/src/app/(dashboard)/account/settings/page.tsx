import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { AccountChrome } from "@/features/dashboard/components/AccountChrome";
import { SettingsPage } from "@/features/dashboard/components/SettingsPage";
import { getServerSession } from "@/lib/auth/session";
import { accountDeletionBlockers } from "@/lib/services/account-deletion.service";
import { getAccountProfile } from "@/lib/services/account.service";
import { getAccountSignIn } from "@/lib/services/account-sign-in.service";
import { ensureAccountTeam, teamsJoined } from "@/lib/services/account-team.service";
import { listApiTokens } from "@/lib/services/api-token.service";
import { listAuditEvents } from "@/lib/services/audit-event.service";

import { prisma } from "@/lib/prisma";
import { isBillingScopeWhitelisted } from "@/lib/services/billing-entitlement-whitelist.service";

export const instant = false;

export default async function AccountSettingsRoute() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const [events, profile, tokens, signIn, deletionBlockers, team, joinedTeams] =
    await Promise.all([
      listAuditEvents(session.user.id),
      getAccountProfile(session.user.id),
      listApiTokens(session.user.id),
      getAccountSignIn(await headers(), {
        userId: session.user.id,
        sessionId: session.session.id,
      }),
      accountDeletionBlockers(session.user.id),
      ensureAccountTeam(session.user.id),
      teamsJoined(session.user.id),
    ]);

  const allOrgIds = [team.id, ...joinedTeams.map((t) => t.organizationId)];

  const [subscriptions, personalSub, whitelistExemptions, dbInvoices, dbInvites] = await Promise.all([
    prisma.billingSubscription.findMany({
      where: {
        organizationId: { in: allOrgIds },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.billingSubscription.findFirst({
      where: {
        userId: session.user.id,
        organizationId: null,
      },
      orderBy: { createdAt: "desc" },
    }),
    Promise.all(
      allOrgIds.map(async (orgId) => {
        const exempt = await isBillingScopeWhitelisted({
          organizationId: orgId,
          ownerId: session.user.id,
        }).catch(() => false);
        return [orgId, exempt] as const;
      }),
    ),
    prisma.billingInvoice.findMany({
      where: {
        subscription: {
          OR: [
            { organizationId: { in: allOrgIds } },
            { userId: session.user.id },
          ],
        },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        stripeInvoiceId: true,
        amountDueCents: true,
        amountPaidCents: true,
        amountRemainingCents: true,
        currency: true,
        status: true,
        hostedInvoiceUrl: true,
        createdAt: true,
      },
    }),
    prisma.invitation.findMany({
      where: {
        email: session.user.email,
        status: "pending",
      },
      include: {
        organization: {
          select: { id: true, name: true, slug: true, logo: true },
        },
        inviter: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const invoices = dbInvoices.map((inv) => ({
    id: inv.id,
    stripeInvoiceId: inv.stripeInvoiceId,
    amountDueCents: inv.amountDueCents,
    amountPaidCents: inv.amountPaidCents,
    amountRemainingCents: inv.amountRemainingCents,
    currency: inv.currency,
    status: inv.status,
    hostedInvoiceUrl: inv.hostedInvoiceUrl,
    createdAt: inv.createdAt.toISOString(),
  }));

  const invites = dbInvites.map((inv) => ({
    id: inv.id,
    organizationId: inv.organization.id,
    organizationName: inv.organization.name,
    organizationSlug: inv.organization.slug,
    organizationLogo: inv.organization.logo,
    role: inv.role,
    inviterName: inv.inviter.name,
    inviterEmail: inv.inviter.email,
    createdAt: inv.createdAt.toISOString(),
  }));

  const subMap = new Map<string, (typeof subscriptions)[0]>();
  for (const sub of subscriptions) {
    if (sub.organizationId && !subMap.has(sub.organizationId)) {
      subMap.set(sub.organizationId, sub);
    }
  }
  const whitelistMap = new Map(whitelistExemptions);

  const resolveTeamBilling = (orgId: string, isAccountTeam: boolean) => {
    if (whitelistMap.get(orgId)) {
      return { plan: "enterprise", status: "active" };
    }
    const sub = subMap.get(orgId) ?? (isAccountTeam ? personalSub : null);
    if (sub) {
      return {
        plan: sub.planKey || "pro",
        status: sub.status || "active",
      };
    }
    return { plan: "hobby", status: "active" };
  };

  const primaryBilling = resolveTeamBilling(team.id, true);

  const teams = [
    {
      id: team.id,
      name: team.name,
      slug: team.slug,
      logo: team.logo ?? null,
      plan: primaryBilling.plan,
      status: primaryBilling.status,
      role: "Owner",
    },
    ...joinedTeams.map((t) => {
      const billing = resolveTeamBilling(t.organizationId, false);
      return {
        id: t.organizationId,
        name: t.name,
        slug: t.username,
        logo: t.image ?? null,
        plan: billing.plan,
        status: billing.status,
        role: t.role === "owner" ? "Owner" : "Member",
      };
    }),
  ];

  return (
    <div className="dashboard-surface min-h-screen bg-(--ink) text-foreground">
      <AccountChrome
        user={{
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        }}
        workspaceName={team?.slug || profile.username || "account"}
      />
      <div className="lg:pl-67 min-w-0 max-w-full">
        <div className="h-14" aria-hidden="true" />
        <main className="min-h-[calc(100vh-3.5rem)] min-w-0 max-w-full">
          <SettingsPage
            deletionBlockers={deletionBlockers}
            emailVerified={session.user.emailVerified ?? false}
            events={events}
            invites={invites}
            invoices={invoices}
            profile={profile}
            signIn={signIn}
            teams={teams}
            tokens={tokens}
            twoFactorEnabled={session.user.twoFactorEnabled ?? false}
            userId={session.user.id}
          />
        </main>
      </div>
    </div>
  );
}
