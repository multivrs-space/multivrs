import "server-only";
import { ConflictError } from "@multivrs/error-utils";
import { METER_CATALOG } from "@/lib/payments/billing.catalog";
import {
  decideUsage,
  metricAllowance,
} from "@/lib/payments/billing-calculation";
import { prisma } from "@/lib/prisma";
import { resolveBillingEntitlements } from "@/lib/services/billing-entitlement.service";

const METRIC = "mail_email_units";
const count = new Intl.NumberFormat("en-US");

/**
 * Whether the plan can carry `quantity` more emails this period, checked
 * the same way each email is metered at delivery. A broadcast asks before
 * it starts, so it doesn't send half and then fail one copy at a time.
 */
export async function assertMailAllowance(
  userId: string,
  projectId: string | null,
  quantity: number,
): Promise<void> {
  const entitlements = await resolveBillingEntitlements(userId, projectId);
  const scopeKey =
    METER_CATALOG[METRIC]?.projectScoped && projectId
      ? `${entitlements.scopeKey}:project:${projectId}`
      : entitlements.scopeKey;
  const period = {
    gte: entitlements.currentPeriodStart,
    lt: entitlements.currentPeriodEnd,
  };
  const [usage, spend] = await Promise.all([
    prisma.usageEvent.aggregate({
      where: { billingScopeKey: scopeKey, metric: METRIC, occurredAt: period },
      _sum: { quantity: true },
    }),
    entitlements.subscriptionId
      ? prisma.billingMeterEvent.aggregate({
          where: {
            billingSubscriptionId: entitlements.subscriptionId,
            createdAt: period,
          },
          _sum: { estimatedCostCents: true },
        })
      : null,
  ]);
  const used = usage._sum.quantity ?? 0n;
  const decision = decideUsage({
    context: entitlements.context,
    currentEstimatedCostCents: spend?._sum.estimatedCostCents ?? 0,
    metric: METRIC,
    quantity: BigInt(quantity),
    used,
  });
  if (decision.allowed) return;
  const allowance = metricAllowance(entitlements.context, METRIC);
  const left =
    allowance === null ? null : allowance > used ? allowance - used : 0n;
  throw new ConflictError(
    `This reaches ${count.format(quantity)} ${quantity === 1 ? "person" : "people"}${
      left === null
        ? ""
        : `, and your plan has ${count.format(left)} emails left this period`
    }. ${decision.reason ?? "Usage limit reached."}`,
  );
}
