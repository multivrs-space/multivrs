import type { MergedContacts } from "@/features/mail/contacts/contact-merge";

const count = new Intl.NumberFormat("en-US");

/** What the merged files add up to, and the first few rows as a check. */
export function ContactImportSummary({ merged }: { merged: MergedContacts }) {
  const stats = [
    { label: "Contacts", value: merged.contacts.length },
    { label: "Duplicates merged", value: merged.duplicates },
    { label: "Skipped", value: merged.invalid },
  ];
  const sample = merged.contacts.slice(0, 4);
  return (
    <div className="space-y-3">
      <dl className="grid grid-cols-3 gap-2">
        {stats.map((stat) => (
          <div
            className="surface-inset rounded-tile px-3 py-2.5"
            key={stat.label}
          >
            <dt className="text-[11px] text-muted-foreground">{stat.label}</dt>
            <dd className="font-hanken text-[20px] font-semibold tabular-nums tracking-[-0.02em] text-foreground">
              {count.format(stat.value)}
            </dd>
          </div>
        ))}
      </dl>
      {sample.length ? (
        <div className="overflow-hidden rounded-tile border border-hairline">
          <table className="w-full table-fixed text-left text-[12px]">
            <thead className="bg-foreground/[0.03] text-muted-foreground">
              <tr>
                <th className="w-[55%] px-3 py-1.5 font-medium">Email</th>
                <th className="px-3 py-1.5 font-medium">Name</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {sample.map((contact) => (
                <tr key={contact.email}>
                  <td className="truncate px-3 py-1.5 font-geist-mono text-[11.5px] text-foreground">
                    {contact.email}
                  </td>
                  <td className="truncate px-3 py-1.5 text-muted-foreground">
                    {[contact.firstName, contact.lastName]
                      .filter(Boolean)
                      .join(" ") || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {merged.contacts.length > sample.length ? (
            <p className="border-t border-hairline px-3 py-1.5 text-[11.5px] text-muted-foreground">
              and {count.format(merged.contacts.length - sample.length)} more
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
