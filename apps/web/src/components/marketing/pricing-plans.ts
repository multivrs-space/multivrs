import {
  ArrowUpDown,
  BadgeCheck,
  Blocks,
  Boxes,
  ChartNoAxesCombined,
  CheckCircle2,
  ContactRound,
  Cpu,
  Database,
  Earth,
  Gauge,
  GitBranch,
  Globe,
  Headset,
  LifeBuoy,
  type LucideIcon,
  Mailbox,
  RadioTower,
  Shield,
  ShieldCheck,
  ShieldCog,
  TimerReset,
  User,
  UserRoundCog,
  UsersRound,
  WalletCards,
  Workflow,
  Zap,
} from "lucide-react";

const FEATURE_ICON_RULES: Array<{ icon: LucideIcon; words: string[] }> = [
  // Mail & messaging
  {
    icon: Mailbox,
    words: ["mail", "mailbox", "mailboxes", "emails", "email domain"],
  },

  // Containers & Sandboxes
  {
    icon: Boxes,
    words: ["sandbox container", "sandbox", "container", "containers", "isolated"],
  },

  // Serverless & Invocations & Compute
  {
    icon: Zap,
    words: ["invocations", "serverless invocations"],
  },
  {
    icon: Cpu,
    words: [
      "serverless functions",
      "serverless",
      "fluid compute",
      "compute",
      "cpu-hours",
      "cpu",
    ],
  },

  // Seats & Users
  {
    icon: User,
    words: [
      "developer seat",
      "user seat",
      "personal",
      "1 user",
      "1 developer",
    ],
  },
  {
    icon: UsersRound,
    words: [
      "team collaboration",
      "collaboration & seats",
      "seats",
      "team members",
    ],
  },

  // Domains & SSL
  {
    icon: Globe,
    words: ["ssl", "custom domain", "custom domains", "domains"],
  },

  // Storage & Databases
  {
    icon: Database,
    words: ["storage", "fast data transfer & storage"],
  },

  // Bandwidth & Data Transfer & CDN
  {
    icon: ArrowUpDown,
    words: ["fast data transfer", "data transfer", "egress", "bandwidth"],
  },
  {
    icon: RadioTower,
    words: ["cdn", "content delivery"],
  },

  // Support
  {
    icon: LifeBuoy,
    words: ["community support", "community"],
  },
  {
    icon: Headset,
    words: ["priority support", "support"],
  },

  // Git & CI/CD
  { icon: GitBranch, words: ["repo", "repository", "deploy from git"] },
  {
    icon: Workflow,
    words: ["ci/cd", "continuous integration", "automatic deployment"],
  },

  // Security & WAF
  {
    icon: Shield,
    words: ["web application firewall", "web firewall", "waf"],
  },
  { icon: ShieldCheck, words: ["ddos"] },

  // Analytics & Insights
  {
    icon: ChartNoAxesCombined,
    words: ["traffic", "performance insights", "speed insights"],
  },

  // Spend & billing
  {
    icon: WalletCards,
    words: ["spend management", "spend control"],
  },

  // Builds & Performance
  {
    icon: Gauge,
    words: ["faster build", "no queue"],
  },
  {
    icon: TimerReset,
    words: ["cold start"],
  },
  {
    icon: Blocks,
    words: ["enterprise add-on"],
  },
];

export function iconForPricingFeature(text: string): LucideIcon {
  const normalized = text.toLowerCase();
  return (
    FEATURE_ICON_RULES.find(({ words }) =>
      words.some((word) => normalized.includes(word)),
    )?.icon ?? CheckCircle2
  );
}

export const ENTERPRISE_FEATURES = [
  { text: "Guest and team permissions", icon: UserRoundCog },
  { text: "Company directory sync", icon: ContactRound },
  { text: "Managed firewall rules", icon: ShieldCog },
  { text: "Multi-region failover", icon: Earth },
  { text: "99.99% uptime", icon: BadgeCheck },
  { text: "Priority support", icon: Headset },
];
