"use client";

import {
  Activity,
  Check,
  ChevronDown,
  Coins,
  CreditCard,
  Database,
  ExternalLink,
  Globe,
  HelpCircle,
  Loader2,
  Mail,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { TeamAvatar } from "@/components/TeamAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { startSubscriptionCheckout } from "@/features/billing/subscription-checkout-api";
import type { DashboardWorkspace } from "@/features/dashboard/types/workspace.types";
import type { PlanKey } from "@/lib/payments/billing.types";
import {
  PRO_BASE_PRICE_USD,
  PRO_MODULAR_MODULES,
} from "@/lib/payments/pro-modular-catalog";

interface UpgradeSheetProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    username: string;
  };
  workspaceName: string;
  workspaces?: DashboardWorkspace[];
  features?: string[];
  featureDescriptions?: Record<string, string>;
  currentPlan?: string;
}

interface PaymentInfo {
  hasPaymentMethod: boolean;
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  email: string;
}

interface WorkspaceOption {
  id: string;
  name: string;
  slug: string;
  isPersonal: boolean;
  organizationId?: string | null;
  plan?: PlanKey;
  username?: string;
  image?: string | null;
}

const DEFAULT_PRO_CARD_FEATURES = [
  "Flat Rate CDN",
  "Free Domain & Managed SSL",
  "Serverless & Sandbox Runtimes",
  "Global Edge Network",
  "Observability & Tracing",
  "Advanced WAF Protection",
  "On-demand Concurrent Builds",
  "Team Collaboration & RBAC",
  "Enterprise-grade Paid Add-ons",
];

const DEFAULT_PRO_CARD_DESCRIPTIONS: Record<string, string> = {
  "Flat Rate CDN": "Protection from unexpected traffic spikes",
  "Free Domain & Managed SSL": "Claim one domain from select TLDs with automated SSL",
  "Serverless & Sandbox Runtimes": "1M monthly invocations and isolated container environments",
  "Global Edge Network": "Cold start prevention and low-latency anycast routing",
  "Observability & Tracing": "Advanced monitoring, distributed error tracing and longer retention",
  "Advanced WAF Protection": "Custom security rules, DDoS mitigation and rate limiting",
  "On-demand Concurrent Builds": "Faster builds that dynamically scale with zero queueing",
  "Team Collaboration & RBAC": "Collaborate with your team with role-based member permissions",
  "Enterprise-grade Paid Add-ons": "Dedicated mailboxes, SAML SSO, and volume discounts",
};

function renderModularIcon(iconName: string) {
  const sizeClass = "size-3.5 text-zinc-300";
  switch (iconName) {
    case "Users":
      return <Users className={sizeClass} />;
    case "Mail":
      return <Mail className={sizeClass} />;
    case "Activity":
      return <Activity className={sizeClass} />;
    case "Database":
      return <Database className={sizeClass} />;
    default:
      return <Users className={sizeClass} />;
  }
}

export function UpgradeSheet({
  user,
  workspaceName,
  workspaces: propWorkspaces,
  features,
  featureDescriptions,
  currentPlan = "hobby",
}: UpgradeSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [organizations, setOrganizations] = useState<
    Array<{
      id: string;
      name: string;
      slug: string;
      accountOwnerId?: string | null;
    }>
  >([]);

  // Modular add-on selection: default all enabled ($50 max), toggleable down to $20
  const [selectedAddonKeys, setSelectedAddonKeys] = useState<
    Record<string, boolean>
  >(() =>
    Object.fromEntries(
      PRO_MODULAR_MODULES.map((m) => [m.key, m.defaultEnabled]),
    ),
  );

  const totalPrice = useMemo(() => {
    let sum = PRO_BASE_PRICE_USD;
    for (const mod of PRO_MODULAR_MODULES) {
      if (selectedAddonKeys[mod.key]) {
        sum += mod.priceUsd;
      }
    }
    return sum;
  }, [selectedAddonKeys]);

  const activeWorkspaceName = workspaceName || user.username || "Personal";

  const includedFeatures = useMemo(() => {
    const list =
      features && features.length > 0 ? features : DEFAULT_PRO_CARD_FEATURES;
    return list.map((title) => {
      const desc =
        featureDescriptions?.[`desc:${title}`] ||
        featureDescriptions?.[`desc_${title}`] ||
        featureDescriptions?.[title] ||
        featureDescriptions?.[`desc:${title.toLowerCase()}`] ||
        featureDescriptions?.[title.toLowerCase()] ||
        DEFAULT_PRO_CARD_DESCRIPTIONS[title] ||
        null;
      return { title, description: desc };
    });
  }, [features, featureDescriptions]);

  const personalWorkspace: WorkspaceOption = useMemo(
    () => ({
      id: "personal",
      name: activeWorkspaceName,
      slug: workspaceName || user.username,
      username: user.username,
      image: user.image,
      isPersonal: true,
      organizationId: null,
      plan: currentPlan as PlanKey,
    }),
    [activeWorkspaceName, workspaceName, user.username, user.image, currentPlan],
  );

  const selectableWorkspaces = useMemo<WorkspaceOption[]>(() => {
    if (propWorkspaces && propWorkspaces.length > 0) {
      return propWorkspaces.map((w) => ({
        id: w.username,
        name: w.name || w.username,
        slug: w.username,
        username: w.username,
        image: w.image,
        isPersonal: !w.role,
        organizationId: w.role ? w.username : null,
        plan: w.plan,
      }));
    }

    const list: WorkspaceOption[] = [personalWorkspace];
    if (organizations && organizations.length > 0) {
      for (const org of organizations) {
        list.push({
          id: org.id,
          name: org.name,
          slug: org.slug,
          username: org.slug,
          image: null,
          isPersonal: false,
          organizationId: org.id,
        });
      }
    }
    return list;
  }, [propWorkspaces, personalWorkspace, organizations]);

  const [selectedWorkspace, setSelectedWorkspace] =
    useState<WorkspaceOption>(() => {
      const match = selectableWorkspaces.find((w) => w.slug === workspaceName);
      return match || personalWorkspace;
    });

  // Sync selected workspace when current workspace changes
  useEffect(() => {
    const match = selectableWorkspaces.find((w) => w.slug === workspaceName);
    if (match) {
      setSelectedWorkspace(match);
    }
  }, [workspaceName, selectableWorkspaces]);

  // Check URL parameters on mount once
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const upgradeTeamParam = params.get("upgradeTeam");
    const upgradeParam = params.get("upgrade");

    if (upgradeTeamParam || upgradeParam) {
      setIsOpen(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  // Listen to custom window event to open from anywhere in the client
  useEffect(() => {
    function handleCustomOpen() {
      setIsOpen(true);
    }

    window.addEventListener("open-upgrade-sheet", handleCustomOpen);
    return () => {
      window.removeEventListener("open-upgrade-sheet", handleCustomOpen);
    };
  }, []);

  // Fetch organizations lazily when sheet is opened (including all account teams)
  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    fetch("/api/auth/organization/list")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && Array.isArray(data)) {
          setOrganizations(data);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [isOpen]);

  // Fetch payment method information
  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    fetch("/api/billing/payment-method")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: PaymentInfo | null) => {
        if (active && data) {
          setPaymentInfo(data);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [isOpen]);

  function handleClose() {
    setIsOpen(false);
    setIsUpgrading(false);
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }

  async function handleUpgrade() {
    setIsUpgrading(true);
    try {
      const activeAddons = PRO_MODULAR_MODULES.filter(
        (mod) => selectedAddonKeys[mod.key],
      ).map(
        (mod) =>
          mod.key as
            | "developer_seat"
            | "mail_volume"
            | "observability_plus",
      );

      const checkoutUrl = await startSubscriptionCheckout({
        organizationId: selectedWorkspace.organizationId,
        returnSlug: selectedWorkspace.slug,
        addOns: activeAddons,
      });
      window.location.assign(checkoutUrl);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to initiate upgrade",
      );
      setIsUpgrading(false);
    }
  }

  const userEmail = paymentInfo?.email || user.email;

  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);

  // Plan transition logic: Upgrade vs Downgrade vs Update
  const effectivePlan = selectedWorkspace.plan || currentPlan || "hobby";
  const isCurrentlyPro = effectivePlan === "pro";
  const isCurrentlyEnterprise = effectivePlan === "enterprise";

  let actionTitle = `Upgrade ${selectedWorkspace.name} to Pro`;
  let actionSubtitle = "Unlock collaboration and improved performance.";
  let actionButtonLabel = "Upgrade to Pro";

  if (isCurrentlyPro) {
    actionTitle = `Manage ${selectedWorkspace.name} Pro Plan`;
    actionSubtitle = "Customize active add-ons and compute capabilities.";
    actionButtonLabel = "Update subscription";
  } else if (isCurrentlyEnterprise) {
    actionTitle = `Switch ${selectedWorkspace.name} to Pro`;
    actionSubtitle = "Change plan tier from Enterprise to Pro.";
    actionButtonLabel = "Downgrade to Pro";
  }

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(val) => {
        if (!val) handleClose();
      }}
    >
      <SheetContent
        side="right"
        showCloseButton={false}
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement | null;
          if (
            target?.closest?.(
              "[data-radix-popper-content-wrapper], [role='menu'], [role='menuitem'], [data-slot='dropdown-menu-content']",
            )
          ) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement | null;
          if (
            target?.closest?.(
              "[data-radix-popper-content-wrapper], [role='menu'], [role='menuitem'], [data-slot='dropdown-menu-content']",
            )
          ) {
            e.preventDefault();
          }
        }}
        className="w-full sm:max-w-none md:w-[860px] md:max-w-[860px] p-0 border-l border-zinc-800 bg-black text-white shadow-2xl overflow-y-auto font-sans"
      >
        <SheetTitle className="sr-only">{actionTitle}</SheetTitle>
        <SheetDescription className="sr-only">
          {actionSubtitle}
        </SheetDescription>

        <div className="flex flex-col md:flex-row min-h-full divide-y md:divide-y-0 md:divide-x divide-zinc-800">
          {/* Left Column: What's included */}
          <div className="w-full md:w-[320px] shrink-0 p-6 md:p-8 flex flex-col justify-between bg-zinc-950/70 border-r border-zinc-800/80">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-white mb-1">
                What&apos;s included
              </h2>
              <p className="text-xs text-zinc-400 mb-5">
                All Hobby features, plus:
              </p>
              <ul className="space-y-3.5">
                {includedFeatures.map(({ title, description }) => (
                  <li key={title} className="flex items-start gap-3">
                    <Check className="size-3.5 stroke-[2.5] text-zinc-300 mt-0.5 shrink-0" />
                    <div className="flex-1 text-xs">
                      <div className="flex items-center gap-1.5 font-medium text-zinc-100">
                        <span>{title}</span>
                      </div>
                      {description && (
                        <p className="text-zinc-400 mt-0.5 leading-normal text-[11px]">
                          {description}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 border-t border-zinc-800/80 mt-6">
              <Link
                href="/pricing"
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors group"
              >
                <ExternalLink className="size-3.5 text-zinc-400 group-hover:text-white" />
                <span>Learn more about pricing</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Unified Checkout & Review with Live Toggles */}
          <div className="flex-1 p-6 md:p-8 flex flex-col relative bg-black min-w-0 md:min-w-[480px]">
            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-5 right-5 size-8 rounded-md flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer z-10"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>

            {/* Header */}
            <div className="flex flex-col items-center text-center pt-2">
              <div className="flex items-center gap-2">
                <TeamAvatar
                  name={selectedWorkspace.name || selectedWorkspace.username}
                  image={selectedWorkspace.image}
                  size={28}
                />
                <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
                  Pro
                </span>
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-white mt-3">
                {actionTitle}
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                {actionSubtitle}
              </p>

              {/* Prominent Team / Workspace Selector */}
              <div className="mt-3 flex items-center justify-center">
                <DropdownMenu
                  open={workspaceDropdownOpen}
                  onOpenChange={setWorkspaceDropdownOpen}
                  modal={false}
                >
                  <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-900 hover:border-zinc-700 text-xs text-zinc-200 transition-colors cursor-pointer group shadow-xs">
                    <TeamAvatar
                      name={selectedWorkspace.name || selectedWorkspace.username}
                      image={selectedWorkspace.image}
                      size={16}
                    />
                    <span className="text-zinc-500 font-normal">Workspace:</span>
                    <span className="font-medium text-zinc-100 truncate max-w-[150px]">
                      {selectedWorkspace.name}
                    </span>
                    {selectedWorkspace.plan && (
                      <span className="shrink-0 rounded-full bg-zinc-800 px-1.5 py-0.2 text-[9px] font-medium text-zinc-400 capitalize border border-zinc-700/50">
                        {selectedWorkspace.plan}
                      </span>
                    )}
                    <ChevronDown className="size-3 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="center"
                    onCloseAutoFocus={(e) => e.preventDefault()}
                    className="w-64 border-zinc-800 bg-zinc-950 p-1.5 text-xs font-sans shadow-2xl"
                  >
                    <div className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                      Switch Workspace
                    </div>
                    {selectableWorkspaces.map((w) => {
                      const isSelected = w.slug === selectedWorkspace.slug;
                      return (
                        <DropdownMenuItem
                          key={w.slug}
                          onClick={() => {
                            setSelectedWorkspace(w);
                            setWorkspaceDropdownOpen(false);
                          }}
                          className="flex items-center justify-between px-2.5 py-2 cursor-pointer rounded-md hover:bg-zinc-900 text-zinc-200 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <TeamAvatar
                              name={w.name || w.username}
                              image={w.image}
                              size={16}
                            />
                            <span className="truncate font-medium">{w.name}</span>
                            {w.plan && (
                              <span className="shrink-0 rounded-full bg-zinc-800 px-1.5 py-0.2 text-[9px] font-medium text-zinc-400 capitalize border border-zinc-700/50">
                                {w.plan}
                              </span>
                            )}
                          </div>
                          {isSelected && (
                            <Check className="size-3.5 text-zinc-100 stroke-[2.5]" />
                          )}
                        </DropdownMenuItem>
                      );
                    })}

                    <DropdownMenuSeparator className="my-1 border-t border-zinc-800/80" />

                    <DropdownMenuItem
                      onClick={() => {
                        handleClose();
                        window.location.href = "/account/settings#team";
                      }}
                      className="px-2.5 py-1.5 cursor-pointer rounded-md hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 text-xs"
                    >
                      + Create a new team
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Cards Section */}
            <div className="mt-7 space-y-3">
              {/* Card 1: Included credit */}
              <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-950/60 text-xs">
                <div className="flex items-center gap-3">
                  <Coins className="size-4 text-primary" />
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-zinc-200">
                      Included credit
                    </span>
                    <HelpCircle className="size-3 text-zinc-500" />
                  </div>
                </div>
                <span className="font-semibold text-primary font-mono">
                  $20
                </span>
              </div>

              {/* Card 2: Free domain with Pro */}
              <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-950/60 text-xs">
                <div className="flex items-center gap-3">
                  <Globe className="size-4 text-primary" />
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-zinc-200">
                      Free domain with Pro
                    </span>
                    <HelpCircle className="size-3 text-zinc-500" />
                  </div>
                </div>
                <span className="font-semibold text-primary font-mono">
                  $0
                </span>
              </div>

              {/* Card 3: Payment Method card */}
              <div className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-zinc-800 bg-zinc-950/60 text-xs">
                <div className="flex items-center gap-3">
                  <CreditCard className="size-4 text-zinc-400 shrink-0" />
                  <div>
                    {paymentInfo?.hasPaymentMethod ? (
                      <>
                        <p className="font-medium text-zinc-200 capitalize">
                          {paymentInfo.brand || "Card"} ending in{" "}
                          {paymentInfo.last4 || "••••"}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          exp. {paymentInfo.expMonth || "12"}/
                          {paymentInfo.expYear || "2028"}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-zinc-200">
                          Payment Method
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          Entered securely via Stripe Checkout
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-zinc-500 truncate max-w-50">
                  {userEmail}
                </span>
              </div>

              {/* Table: Product & Cost breakdown with Modular Switches */}
              <div className="pt-2 text-xs">
                <div className="flex items-center justify-between text-zinc-500 pb-2 border-b border-zinc-800 text-[11px]">
                  <span>Product</span>
                  <span>Cost</span>
                </div>

                {/* Mandatory Pro Platform Base */}
                <div className="py-2.5 flex items-center justify-between text-zinc-200">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-3.5 text-zinc-400" />
                    <span>Pro Platform Base</span>
                  </div>
                  <span className="font-mono text-zinc-300 font-medium">$20</span>
                </div>

                {/* Modular Add-on Toggle Rows */}
                {PRO_MODULAR_MODULES.map((mod) => {
                  const isChecked = !!selectedAddonKeys[mod.key];
                  return (
                    <div
                      key={mod.key}
                      className="py-2.5 flex items-center justify-between border-t border-zinc-800/80 text-zinc-200"
                    >
                      <div className="flex items-center gap-2.5 pr-2">
                        <div className="size-6 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                          {renderModularIcon(mod.iconName)}
                        </div>
                        <div className="space-y-0.5">
                          <span className="font-medium text-zinc-200">
                            {mod.name}
                          </span>
                          <p className="text-[10px] text-zinc-500">
                            {mod.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-xs font-medium text-zinc-300">
                          {isChecked ? `+$${mod.priceUsd}` : "$0"}
                        </span>
                        <Switch
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            setSelectedAddonKeys((prev) => ({
                              ...prev,
                              [mod.key]: checked,
                            }))
                          }
                          aria-label={`Toggle ${mod.name}`}
                        />
                      </div>
                    </div>
                  );
                })}

                <div className="py-2.5 flex items-center justify-between border-t border-zinc-800/80 text-zinc-400">
                  <span>Estimated tax</span>
                  <span className="font-mono">$0</span>
                </div>

                {/* Live Total */}
                <div className="py-3 flex items-center justify-between border-t border-zinc-800 font-semibold text-white text-sm">
                  <span>Total</span>
                  <span className="font-mono text-base font-bold text-white">
                    ${totalPrice}
                    <span className="text-xs font-normal text-zinc-400">
                      {" "}
                      / month
                    </span>
                  </span>
                </div>
              </div>

              {/* Legal Terms Disclaimer */}
              <p className="text-[11px] text-zinc-500 leading-relaxed pt-1">
                You will be charged ${totalPrice} immediately. Renews monthly in
                advance at ${totalPrice} plus any metered usage or overages.
                Downgrade or cancel any time in Settings.
              </p>

              {/* Actions directly beneath disclaimer: Brand Purple Button */}
              <div className="pt-6 space-y-2.5">
                <button
                  type="button"
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                  className="w-full h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isUpgrading ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Redirecting to Checkout...</span>
                    </>
                  ) : (
                    <span>{actionButtonLabel}</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isUpgrading}
                  className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer text-center w-full py-1 block"
                >
                  Cancel
                </button>

                <p className="text-center text-[11px] text-zinc-500 pt-1">
                  Need custom limits, SAML SSO, or an SLA?{" "}
                  <Link
                    href="/contact/sales"
                    onClick={handleClose}
                    className="text-zinc-400 hover:text-white underline underline-offset-2 transition-colors"
                  >
                    Contact Sales for Enterprise
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
