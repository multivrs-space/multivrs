import { ENVELOPE_FIELD } from "@/features/mail/compose/EnvelopeLine";
import { mailboxGroups } from "@/features/mail/lib/mailbox-groups";
import type { MailboxSummary } from "@/features/mail/mail.types";

/**
 * Who the email is from, grouped by domain. A reply or forward starts on the
 * mailbox the message is in, so an email to hello@ is answered from hello@.
 */
export function FromSelect({
  mailboxes,
  preferredId,
}: {
  mailboxes: MailboxSummary[];
  preferredId?: string;
}) {
  const initial =
    mailboxes.find((mailbox) => mailbox.id === preferredId)?.id ??
    mailboxes[0]?.id;
  return (
    <select
      className={`${ENVELOPE_FIELD} cursor-pointer`}
      defaultValue={initial}
      id="compose-from"
      key={initial}
      name="mailboxId"
      required
    >
      {mailboxGroups(mailboxes).map((group) => (
        <optgroup key={group.domain} label={group.domain}>
          {group.mailboxes.map((mailbox) => (
            <option key={mailbox.id} value={mailbox.id}>
              {mailbox.name} &lt;{mailbox.address}&gt;
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
