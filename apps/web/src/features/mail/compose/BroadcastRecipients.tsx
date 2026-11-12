import {
  ENVELOPE_FIELD,
  EnvelopeLine,
} from "@/features/mail/compose/EnvelopeLine";
import type {
  MailboxSummary,
  MailResourceItem,
} from "@/features/mail/mail.types";

const count = new Intl.NumberFormat("en-US");

/** Who a campaign comes from, and whether everyone or one segment gets it. */
export function BroadcastRecipients({
  mailboxes,
  audiences,
  subscribed,
}: {
  mailboxes: MailboxSummary[];
  audiences: MailResourceItem[];
  /** Contacts a send to everyone reaches. */
  subscribed: number;
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
        <select
          className={`${ENVELOPE_FIELD} cursor-pointer`}
          id="broadcast-audience"
          name="audienceId"
        >
          <option value="">
            All contacts · {count.format(subscribed)} subscribed
          </option>
          {audiences.length ? (
            <optgroup label="Segments">
              {audiences.map((audience) => (
                <option key={audience.id} value={audience.id}>
                  {audience.name}
                  {audience.detail ? ` · ${audience.detail}` : ""}
                </option>
              ))}
            </optgroup>
          ) : null}
        </select>
      </EnvelopeLine>
    </>
  );
}
