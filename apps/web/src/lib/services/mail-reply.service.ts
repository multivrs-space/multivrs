import "server-only";
import { prisma } from "@/lib/prisma";
import { accessibleMailMessage } from "@/lib/services/mail-access.service";

/**
 * The message a reply answers: what threading needs from it. People must be
 * able to read it; the account itself (API keys, scheduled sends) may reply
 * to anything it owns.
 */
export async function repliedMessage(
  actorId: string,
  userId: string,
  messageId: string,
  asAccount: boolean,
) {
  return asAccount
    ? prisma.mailMessage.findFirst({
        where: { id: messageId, userId },
        select: {
          direction: true,
          messageId: true,
          providerMessageId: true,
          references: true,
          threadId: true,
        },
      })
    : accessibleMailMessage(actorId, messageId, "read");
}
