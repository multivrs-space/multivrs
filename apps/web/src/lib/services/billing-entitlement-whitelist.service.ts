import "server-only";
import { prisma } from "@/lib/prisma";

type BillingScope = {
  organizationId: string | null;
  ownerId: string;
};

export async function isBillingScopeWhitelisted(
  scope: BillingScope,
): Promise<boolean> {
  const candidateEmails = new Set<string>();

  if (scope.ownerId) {
    const personal = await personalOwnerEmails(scope.ownerId);
    for (const email of personal) {
      if (email) candidateEmails.add(normalizeEmail(email));
    }
  }

  if (scope.organizationId) {
    const orgEmails = await organizationOwnerEmails(scope.organizationId);
    for (const email of orgEmails) {
      if (email) candidateEmails.add(normalizeEmail(email));
    }
  }

  if (candidateEmails.size === 0) return false;

  const entry = await prisma.billingEntitlementWhitelist.findFirst({
    where: {
      email: { in: Array.from(candidateEmails) },
      enabled: true,
    },
    select: { email: true },
  });
  return entry !== null;
}

async function personalOwnerEmails(ownerId: string): Promise<string[]> {
  const owner = await prisma.user.findUnique({
    where: { id: ownerId },
    select: { email: true },
  });
  return owner?.email ? [owner.email] : [];
}

async function organizationOwnerEmails(
  organizationId: string,
): Promise<string[]> {
  const [org, owners] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        accountOwner: { select: { email: true } },
      },
    }),
    prisma.member.findMany({
      where: {
        organizationId,
        role: { in: ["owner", "admin"] },
      },
      select: { user: { select: { email: true } } },
    }),
  ]);

  const emails: string[] = [];
  if (org?.accountOwner?.email) {
    emails.push(org.accountOwner.email);
  }
  for (const owner of owners) {
    if (owner.user?.email) {
      emails.push(owner.user.email);
    }
  }
  return emails;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
