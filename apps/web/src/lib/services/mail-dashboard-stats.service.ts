import "server-only";
import { prisma } from "@/lib/prisma";
import { visibleMailboxWhere } from "@/lib/services/mail-access.service";

/** Folder counts over the account's mailboxes that the viewer may see. */
export async function mailDashboardStats(
  ownerId: string,
  viewerId: string,
  projectId?: string,
) {
  const mailbox = {
    userId: ownerId,
    ...(projectId ? { projectId } : {}),
    ...visibleMailboxWhere(viewerId),
  };
  const [folders, unreadInbox] = await Promise.all([
    prisma.mailMessage.groupBy({
      by: ["folder"],
      where: { mailbox },
      _count: true,
    }),
    prisma.mailMessage.count({
      where: { mailbox, folder: "inbox", isRead: false },
    }),
  ]);
  return {
    folderCounts: {
      ...Object.fromEntries(folders.map((item) => [item.folder, item._count])),
      inbox: unreadInbox,
    },
  };
}
