import "server-only";
import { isAuthenticatedSendingDomain } from "@/lib/mail/mail-domain-dns";
import { mergeValues, personalize } from "@/lib/mail/personalize";
import { unsubscribeFooter } from "@/lib/mail/unsubscribe-footer";
import { unsubscribeLinks } from "@/lib/mail/unsubscribe-token";
import { prisma } from "@/lib/prisma";
import type { BroadcastRecipient } from "@/lib/services/mail-broadcast-recipients.service";
import { composeMail } from "@/lib/services/mail-compose.service";
import { dispatchMailDelivery } from "@/lib/services/mail-dispatch.service";

interface CopySource {
  id: string;
  userId: string;
  subject: string;
  templateVersion: { html: string | null; text: string | null } | null;
}

/** The mailbox a broadcast sends from, or why it can't send yet. */
export async function broadcastSender(broadcast: {
  userId: string;
  fromAddress: string;
}) {
  const mailbox = await prisma.mailbox.findFirst({
    where: {
      userId: broadcast.userId,
      address: broadcast.fromAddress,
      status: "active",
    },
    include: { domain: true },
  });
  if (!mailbox) return `There's no active mailbox for ${broadcast.fromAddress}`;
  if (!isAuthenticatedSendingDomain(mailbox.domain))
    return `Verify ${mailbox.domain?.domain ?? "the sending domain"} before sending from it`;
  return mailbox;
}

/**
 * One recipient's copy: merge tags filled in for them, their own
 * unsubscribe link at the foot, handed straight to delivery.
 */
export async function sendBroadcastCopy(
  broadcast: CopySource,
  mailbox: { id: string; name: string },
  contact: BroadcastRecipient,
): Promise<void> {
  const html = broadcast.templateVersion?.html ?? "";
  const text = broadcast.templateVersion?.text ?? "";
  const values = mergeValues(contact);
  const footer = unsubscribeFooter(
    mailbox.name,
    unsubscribeLinks(contact.id).page,
  );
  const message = await composeMail(
    broadcast.userId,
    {
      mailboxId: mailbox.id,
      to: [contact.email],
      cc: [],
      bcc: [],
      attachments: [],
      subject: personalize(broadcast.subject, values, "text"),
      text: `${personalize(text, values, "text")}${footer.text}`,
      html: html
        ? `${personalize(html, values, "html")}${footer.html}`
        : undefined,
    },
    broadcast.id,
    true,
  );
  await dispatchMailDelivery(broadcast.userId, message.id);
}
