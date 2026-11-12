import type { MailboxSummary } from "@/features/mail/mail.types";

export interface MailboxGroup<
  T extends Pick<MailboxSummary, "address" | "name">,
> {
  domain: string;
  mailboxes: T[];
}

/** Mailboxes by domain (multivrs.space, kontinueai.com…), each group sorted by name. */
export function mailboxGroups<
  T extends Pick<MailboxSummary, "address" | "name">,
>(mailboxes: readonly T[]): MailboxGroup<T>[] {
  const groups = new Map<string, T[]>();
  for (const mailbox of mailboxes) {
    const domain = mailbox.address.split("@")[1]?.toLowerCase() ?? "other";
    groups.set(domain, [...(groups.get(domain) ?? []), mailbox]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([domain, items]) => ({
      domain,
      mailboxes: [...items].sort((a, b) => a.name.localeCompare(b.name)),
    }));
}
