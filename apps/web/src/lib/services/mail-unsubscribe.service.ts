import "server-only";
import { contactFromToken } from "@/lib/mail/unsubscribe-token";
import { prisma } from "@/lib/prisma";

/** Who an unsubscribe link is for, and who sends to them. */
export async function unsubscribeSubject(token: string) {
  const contactId = contactFromToken(token);
  if (!contactId) return null;
  const contact = await prisma.mailContact.findUnique({
    where: { id: contactId },
    select: {
      email: true,
      status: true,
      user: { select: { name: true, accountTeam: { select: { name: true } } } },
    },
  });
  if (!contact) return null;
  return {
    email: contact.email,
    unsubscribed: contact.status === "unsubscribed",
    sender:
      contact.user.accountTeam?.name || contact.user.name || "this sender",
  };
}

/**
 * Stop all broadcasts to the contact the link names. Safe to repeat, and a
 * link someone altered does nothing.
 */
export async function unsubscribeByToken(token: string): Promise<boolean> {
  const contactId = contactFromToken(token);
  if (!contactId) return false;
  const contact = await prisma.mailContact.findUnique({
    where: { id: contactId },
    select: { id: true, userId: true, status: true },
  });
  if (!contact) return false;
  if (contact.status === "unsubscribed") return true;
  await prisma.$transaction([
    prisma.mailContact.update({
      where: { id: contact.id },
      data: { status: "unsubscribed" },
    }),
    prisma.mailEvent.create({
      data: {
        userId: contact.userId,
        type: "contact.unsubscribed",
        payload: { contactId: contact.id },
        occurredAt: new Date(),
      },
    }),
  ]);
  return true;
}
