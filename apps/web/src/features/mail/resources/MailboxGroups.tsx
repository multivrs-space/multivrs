import { DashCard } from "@/components/dashboard/DashCard";
import { LiveGlobe } from "@/components/icons/animated";
import type { MailResourceItem } from "@/features/mail/mail.types";
import { MailResourceActions } from "@/features/mail/resources/MailResourceActions";
import { MailResourceStatus } from "@/features/mail/resources/MailResourceStatus";
import { SenderAvatar } from "@/features/mail/SenderAvatar";

/** Who a mailbox is for, in the order a team thinks of them. */
const KINDS = [
  { kind: "shared", label: "Shared" },
  { kind: "personal", label: "Personal" },
  { kind: "sending", label: "Sending only" },
  { kind: "no-reply", label: "No-reply" },
] as const;

function kindOf(item: MailResourceItem): string {
  const kind = (item.kind ?? "").toLowerCase().replace(/[\s_]/g, "-");
  return kind === "noreply" ? "no-reply" : kind || "other";
}

function byName(a: MailResourceItem, b: MailResourceItem) {
  return a.name.localeCompare(b.name);
}

/**
 * Mailboxes by domain, then by who they're for, as compact rows: dozens of
 * addresses stay scannable where a wall of cards wouldn't.
 */
export function MailboxGroups({ items }: { items: MailResourceItem[] }) {
  const domains = new Map<string, MailResourceItem[]>();
  for (const item of items) {
    const address = item.address ?? item.detail;
    const domain = address.split("@")[1]?.toLowerCase() ?? "Other";
    domains.set(domain, [...(domains.get(domain) ?? []), item]);
  }
  return (
    <div className="space-y-4">
      {[...domains.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([domain, mailboxes]) => (
          <DashCard aria-label={domain} key={domain}>
            <header className="flex items-center gap-2.5 border-b border-hairline px-5 py-3.5">
              <span className="surface-inset grid size-8 place-items-center rounded-[9px] text-muted-foreground">
                <LiveGlobe className="size-4" strokeWidth={1.75} />
              </span>
              <h2 className="font-geist-mono text-[13.5px] font-medium text-foreground">
                {domain}
              </h2>
              <span className="rounded-full bg-foreground/[0.07] px-2 py-px font-geist-mono text-[11px] text-muted-foreground">
                {mailboxes.length}
              </span>
            </header>
            <div className="divide-y divide-hairline">
              {kindGroups(mailboxes).map((group) => (
                <section
                  aria-label={`${domain} ${group.label}`}
                  key={group.kind}
                >
                  <p className="px-5 pt-3 pb-1 font-geist-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
                    {group.label} · {group.items.length}
                  </p>
                  <ul className="px-2 pb-2">
                    {group.items.map((item) => (
                      <MailboxRow item={item} key={item.id} />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </DashCard>
        ))}
    </div>
  );
}

function kindGroups(mailboxes: MailResourceItem[]) {
  const known = KINDS.map(({ kind, label }) => ({
    kind,
    label,
    items: mailboxes.filter((item) => kindOf(item) === kind).sort(byName),
  }));
  const rest = mailboxes
    .filter((item) => !KINDS.some(({ kind }) => kind === kindOf(item)))
    .sort(byName);
  return [...known, { kind: "other", label: "Other", items: rest }].filter(
    (group) => group.items.length,
  );
}

function MailboxRow({ item }: { item: MailResourceItem }) {
  const address = item.address ?? item.detail;
  return (
    <li className="group flex items-center gap-3 rounded-tile px-3 py-2 transition-colors hover:bg-foreground/[0.03]">
      <SenderAvatar address={address} name={item.name} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-medium tracking-[-0.01em] text-foreground">
          {item.name}
        </p>
        <p className="truncate font-geist-mono text-[11.5px] text-muted-foreground">
          {address}
        </p>
      </div>
      <MailResourceStatus kind="orb" status={item.status} />
      <MailResourceActions item={item} view="mailboxes" />
    </li>
  );
}
