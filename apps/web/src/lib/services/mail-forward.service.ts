import "server-only";
import { NotFoundError } from "@multivrs/error-utils";
import { forwardedContent } from "@/lib/mail/forwarded-message";
import { prisma } from "@/lib/prisma";
import { accessibleMailMessage } from "@/lib/services/mail-access.service";

export interface ForwardAttachment {
  filename: string;
  contentType: string;
  size: number;
  contentBase64: string;
  inline: boolean;
  contentId: string | null;
}

/**
 * The body and files of a forward: your note on top, the original email as
 * it was underneath, and its attachments (inline images included, so its
 * layout survives). The forwarder needs to be able to read the original.
 */
export async function forwardParts(
  actorId: string,
  userId: string,
  forwardMessageId: string,
  note: { html?: string; text?: string },
  asAccount: boolean,
): Promise<{ html: string; text: string; attachments: ForwardAttachment[] }> {
  const original = asAccount
    ? await prisma.mailMessage.findFirst({
        where: { id: forwardMessageId, userId },
      })
    : await accessibleMailMessage(actorId, forwardMessageId, "read");
  if (!original) throw new NotFoundError("The message to forward wasn't found");
  const files = await prisma.mailAttachment.findMany({
    where: { messageId: original.id, contentBase64: { not: null } },
    select: {
      filename: true,
      contentType: true,
      size: true,
      contentBase64: true,
      inline: true,
      contentId: true,
    },
  });
  return {
    ...forwardedContent(original, note),
    attachments: files.flatMap((file) =>
      file.contentBase64
        ? [{ ...file, contentBase64: file.contentBase64 }]
        : [],
    ),
  };
}
