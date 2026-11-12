import { LiveUsersRound } from "@/components/icons/animated";
import {
  ENVELOPE_FIELD,
  EnvelopeLine,
} from "@/features/mail/compose/EnvelopeLine";
import type {
  MailboxSummary,
  MailResourceItem,
} from "@/features/mail/mail.types";

/** Who a campaign comes from and which audience gets it. */
export function BroadcastRecipients({
  mailboxes,
  audiences,
}: {
  mailboxes: MailboxSummary[];
  audiences: MailResourceItem[];
}) {
  return (
    <>
      <EnvelopeLine htmlFor="broadcast-from" label="From">
        {mailboxes.length ? (
          <select
            className={`${ENVELOPE_FIELD} cursor-pointer`}
            id="broadcast-from"
            name="fromAddress"
            required
          >
            {mailboxes.map((mailbox) => (
              <option key={mailbox.id} value={mailbox.address}>
                {mailbox.name} &lt;{mailbox.address}&gt;
              </option>
            ))}
          </select>
        ) : (
          <input
            className={ENVELOPE_FIELD}
            id="broadcast-from"
            name="fromAddress"
            placeholder="news@yourdomain.com"
            required
            type="email"
          />
        )}
      </EnvelopeLine>
      <EnvelopeLine htmlFor="broadcast-audience" label="To">
        {audiences.length ? (
          <select
            className={`${ENVELOPE_FIELD} cursor-pointer`}
            id="broadcast-audience"
            name="audienceId"
            required
          >
            {audiences.map((audience) => (
              <option key={audience.id} value={audience.id}>
                {audience.name}
                {audience.detail ? ` · ${audience.detail}` : ""}
              </option>
            ))}
          </select>
        ) : (
          <p
            className="flex h-10 items-center gap-2 text-[12.5px] text-amber-700 dark:text-amber-300"
            data-icon-trigger
            id="broadcast-audience"
          >
            <LiveUsersRound className="size-4 shrink-0" strokeWidth={1.75} />
            Create an audience first, under Audiences.
          </p>
        )}
      </EnvelopeLine>
    </>
  );
}
