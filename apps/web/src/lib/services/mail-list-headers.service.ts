import "server-only";
import { unsubscribeLinks } from "@/lib/mail/unsubscribe-token";
import { prisma } from "@/lib/prisma";

/**
 * Headers an outgoing message carries: threading for replies, and one-click
 * unsubscribe for broadcast copies.
 */
export async function deliveryHeaders(
  userId: string,
  message: {
    id: string;
    inReplyTo: string | null;
    references: string[];
    toAddresses: string[];
  },
): Promise<Record<string, string>> {
  return {
    // Lets the recipient's mail app thread a reply with what it answers.
    ...(message.inReplyTo
      ? {
          "In-Reply-To": message.inReplyTo,
          References: [...message.references, message.inReplyTo]
            .filter((id, index, all) => all.indexOf(id) === index)
            .join(" "),
        }
      : {}),
    ...(await listUnsubscribeHeaders(userId, message.id, message.toAddresses)),
  };
}

/**
 * One-click unsubscribe headers for a broadcast copy, so mail apps show
 * their own Unsubscribe button. Ordinary mail gets none.
 */
async function listUnsubscribeHeaders(
  userId: string,
  messageId: string,
  to: string[],
): Promise<Record<string, string>> {
  const [address] = to;
  if (!address || to.length !== 1) return {};
  const fromBroadcast = await prisma.mailEvent.findFirst({
    where: { messageId, broadcastId: { not: null } },
    select: { id: true },
  });
  if (!fromBroadcast) return {};
  const contact = await prisma.mailContact.findUnique({
    where: { userId_email: { userId, email: address.toLowerCase() } },
    select: { id: true },
  });
  if (!contact) return {};
  const links = unsubscribeLinks(contact.id);
  return {
    "List-Unsubscribe": `<${links.oneClick}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}
