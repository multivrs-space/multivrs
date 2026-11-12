import "server-only";
import type { DisplayPlan } from "@/lib/payments/billing.types";
import { prisma } from "@/lib/prisma";
import {
  type BillingEntitlements,
  displayPlan,
  resolveBillingEntitlements,
} from "@/lib/services/billing-entitlement.service";

/** The billing scope behind a workspace slug: a person's own, or a team's. */
export async function accountEntitlements(
  username: string,
): Promise<BillingEntitlements | null> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (user) return resolveBillingEntitlements(user.id);
  const org = await prisma.organization.findFirst({
    where: {
      OR: [
        { slug: username },
        { slug: username.toLowerCase() },
        { name: username },
      ],
    },
    select: { id: true, accountOwnerId: true },
  });
  return org
    ? resolveBillingEntitlements(org.accountOwnerId ?? "", null, org.id)
    : null;
}

export async function accountPlan(username: string): Promise<DisplayPlan> {
  const entitlements = await accountEntitlements(username);
  return entitlements ? displayPlan(entitlements.context) : "hobby";
}
