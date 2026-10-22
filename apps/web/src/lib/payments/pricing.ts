import "server-only";
import type Stripe from "stripe";
import { z } from "zod";
import { getStripe } from "@/lib/payments/stripe-client";

const PRICE_FORMATTERS = new Map<string, Intl.NumberFormat>();

const priceConfigSchema = z
  .object({
    priceId: z.string().trim().min(1).optional(),
    lookupKey: z.string().trim().min(1).optional(),
  })
  .refine((value) => value.priceId || value.lookupKey);

export type StripePlan = {
  configured: boolean;
  description: string;
  features: string[];
  metadata?: Record<string, string>;
  name: string;
  priceId: string | null;
  priceLabel: string;
  priceSuffix: string;
};

export const DEFAULT_HOBBY_FEATURES = [
  "Deploy from Git (GitHub, GitLab, CLI)",
  "Automatic SSL & custom domains",
  "100K edge requests / month",
  "5 GB fast data transfer / month",
  "Global edge network & routing",
  "Serverless function execution",
  "1 developer seat",
  "Community support",
];

export const DEFAULT_PRO_FEATURES = [
  "Flat rate CDN & DDoS mitigation",
  "Free custom domain & managed SSL",
  "1M serverless invocations & sandbox runtimes",
  "Global edge network with anycast routing",
  "Observability, tracing & error logging",
  "Advanced WAF protection & custom rules",
  "On-demand concurrent builds (zero queue)",
  "Team collaboration & RBAC permissions",
  "Two-way transactional email & mailboxes",
];

function fallbackPlan(name: string): StripePlan {
  if (name.toLowerCase() === "hobby") {
    return {
      configured: true,
      description: "For personal projects, hobbyists, and experiments.",
      features: DEFAULT_HOBBY_FEATURES,
      name: "Hobby",
      priceId: null,
      priceLabel: "$0",
      priceSuffix: "/mo.",
    };
  }
  return {
    configured: false,
    description: "Modular plan starting at $20/mo platform base, up to $50/mo with all add-on modules.",
    features: DEFAULT_PRO_FEATURES,
    name: "Pro",
    priceId: null,
    priceLabel: "$20",
    priceSuffix: "/mo.",
  };
}

function productFrom(price: Stripe.Price): Stripe.Product | null {
  return typeof price.product === "object" &&
    !("deleted" in price.product && price.product.deleted)
    ? price.product
    : null;
}

function formatAmount(price: Stripe.Price): string | null {
  if (price.unit_amount === null) return null;
  const maximumFractionDigits = price.unit_amount % 100 === 0 ? 0 : 2;
  const key = `${price.currency}:${maximumFractionDigits}`;
  let formatter = PRICE_FORMATTERS.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en", {
      style: "currency",
      currency: price.currency,
      maximumFractionDigits,
    });
    PRICE_FORMATTERS.set(key, formatter);
  }
  return formatter.format(price.unit_amount / 100);
}

async function resolvePrice(
  config: z.infer<typeof priceConfigSchema>,
): Promise<Stripe.Price> {
  const stripe = getStripe();
  if (config.priceId) {
    return stripe.prices.retrieve(config.priceId, {
      expand: ["product"],
    });
  }
  const prices = await stripe.prices.list({
    active: true,
    expand: ["data.product"],
    limit: 1,
    lookup_keys: [config.lookupKey as string],
  });
  const price = prices.data[0];
  if (!price) throw new Error("No active Stripe price matched the lookup key");
  return price;
}

async function getStripePlan(
  name: string,
  lookupKeyName:
    | "STRIPE_HOBBY_MONTHLY_LOOKUP_KEY"
    | "STRIPE_PRO_MONTHLY_LOOKUP_KEY",
  priceIdName: "STRIPE_HOBBY_MONTHLY_PRICE_ID" | "STRIPE_PRO_MONTHLY_PRICE_ID",
): Promise<StripePlan> {
  const defaultLookupKey =
    lookupKeyName === "STRIPE_HOBBY_MONTHLY_LOOKUP_KEY"
      ? "multivrs_hobby_v2"
      : "multivrs_pro_base_v2";
  const config = priceConfigSchema.safeParse({
    priceId: process.env[priceIdName] || undefined,
    lookupKey: process.env[lookupKeyName] || defaultLookupKey,
  });
  if (!config.success) return fallbackPlan(name);

  try {
    const price = await resolvePrice(config.data);
    const amount = formatAmount(price);
    if (!amount || !price.active) return fallbackPlan(name);
    const product = productFrom(price);
    if (!product?.active) return fallbackPlan(name);

    const rawFeatures =
      product.marketing_features
        ?.map((feature) => feature.name?.trim())
        .filter((name): name is string => Boolean(name)) ?? [];
    const defaultFeatures =
      name.toLowerCase() === "hobby"
        ? DEFAULT_HOBBY_FEATURES
        : DEFAULT_PRO_FEATURES;
    const features = rawFeatures.length > 0 ? rawFeatures : defaultFeatures;

    return {
      configured: true,
      description:
        product.description?.trim() ||
        (name.toLowerCase() === "hobby"
          ? "For personal projects, hobbyists, and experiments."
          : "Modular plan starting at $20/mo platform base, up to $50/mo with all add-on modules."),
      features,
      metadata: product.metadata ?? {},
      name: product.name,
      priceId: price.id,
      priceLabel: amount,
      priceSuffix: price.recurring
        ? `/${price.recurring.interval === "month" ? "mo." : price.recurring.interval}`
        : "",
    };
  } catch (error) {
    console.error(`[getStripePlan:${name}] error:`, error);
    return fallbackPlan(name);
  }
}

export function getProPlan(): Promise<StripePlan> {
  return getStripePlan(
    "Pro",
    "STRIPE_PRO_MONTHLY_LOOKUP_KEY",
    "STRIPE_PRO_MONTHLY_PRICE_ID",
  );
}

export async function getPricingPlans(): Promise<{
  hobbyPlan: StripePlan;
  proPlan: StripePlan;
}> {
  const [hobbyPlan, proPlan] = await Promise.all([
    getStripePlan(
      "Hobby",
      "STRIPE_HOBBY_MONTHLY_LOOKUP_KEY",
      "STRIPE_HOBBY_MONTHLY_PRICE_ID",
    ),
    getProPlan(),
  ]);
  return { hobbyPlan, proPlan };
}
