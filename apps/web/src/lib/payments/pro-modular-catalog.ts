export interface ProModularModule {
  key: string;
  name: string;
  priceUsd: number;
  lookupKey: string;
  metadataKey: string;
  iconName: "Users" | "Mail" | "Activity" | "Database";
  badge?: string;
  description: string;
  details: string;
  defaultEnabled: boolean;
}

export const PRO_BASE_PRICE_USD = 20;

export const PRO_MODULAR_MODULES: ProModularModule[] = [
  {
    key: "developer_seat",
    name: "Team Collaboration & Seats",
    priceUsd: 5,
    lookupKey: "multivrs_team_seats_v2",
    metadataKey: "developer_seat",
    iconName: "Users",
    description: "2 team seats, role-based access control (RBAC), and preview environments.",
    details: "Role-based member permissions and shared workspace collaboration.",
    defaultEnabled: true,
  },
  {
    key: "mail_volume",
    name: "Multivrs Mail Volume",
    priceUsd: 15,
    lookupKey: "multivrs_mail_volume_v2",
    metadataKey: "mail_volume",
    iconName: "Mail",
    description: "3 team mailboxes, 10,000 monthly emails, inbound webhooks & custom DKIM.",
    details: "Two-way transactional email delivery and managed inboxes.",
    defaultEnabled: true,
  },
  {
    key: "observability_plus",
    name: "Observability Plus",
    priceUsd: 10,
    lookupKey: "multivrs_observability_plus_v2",
    metadataKey: "observability_plus",
    iconName: "Activity",
    description: "30-day log retention, distributed error tracing & Speed Insights profiling.",
    details: "Deep performance traces and extended audit logs.",
    defaultEnabled: true,
  },
];

export function calculateProMaxPrice(): number {
  return (
    PRO_BASE_PRICE_USD +
    PRO_MODULAR_MODULES.reduce((sum, module) => sum + module.priceUsd, 0)
  );
}
