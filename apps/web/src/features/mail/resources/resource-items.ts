import type {
  MailDashboardData,
  MailResourceItem,
  MailResources,
} from "@/features/mail/mail.types";
import type { MailResourceView } from "@/features/mail/resources/mail-resource-views";

/** The list a resource view shows; mailboxes come from the shared data. */
export function resourceItems(
  view: MailResourceView,
  data: MailDashboardData,
  resources: MailResources,
): MailResourceItem[] {
  if (view === "mailboxes") {
    return data.mailboxes.map((item) => ({
      id: item.id,
      name: item.name,
      detail: `${item.address} · ${item.kind}`,
      status: item.status,
      createdAt: "",
      address: item.address,
      kind: item.kind,
    }));
  }
  if (view === "logs") return [];
  return resources[view];
}
