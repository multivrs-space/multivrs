import "server-only";
import { NotFoundError } from "@multivrs/error-utils";
import type { Prisma } from "@prisma/client";
import type {
  MailLogPage,
  MailMessageDetail,
  MailThreadPage,
  MailThreadSummary,
} from "@/features/mail/mail.types";
import { decodeMailCursor, encodeMailCursor } from "@/lib/mail/mail-cursor";
import { prisma } from "@/lib/prisma";
import {
  accessibleMailbox,
  visibleMailboxWhere,
} from "@/lib/services/mail-access.service";
import { mapMessage } from "@/lib/services/mail-dashboard-mappers";

/** Threads per page, like a mail client's list: enough to fill a screen. */
export const MAIL_THREAD_PAGE_SIZE = 50;
const MAIL_LOG_PAGE_SIZE = 50;

/** A folder list, `starred`, or `recent` (every folder, for the overview). */
export type MailThreadListView =
  | "inbox"
  | "sent"
  | "drafts"
  | "archive"
  | "spam"
  | "trash"
  | "starred"
  | "recent";

interface MailScope {
  ownerId: string;
  viewerId: string;
  projectId?: string;
}

function mailboxScope({
  ownerId,
  viewerId,
  projectId,
}: MailScope): Prisma.MailboxWhereInput {
  return {
    userId: ownerId,
    ...(projectId ? { projectId } : {}),
    ...visibleMailboxWhere(viewerId),
  };
}

/**
 * One page of threads, newest first. Rows carry only what the list shows: the
 * newest message's sender, flags, and a short preview, never full bodies. The
 * cursor is the last row's time and id, so mail arriving meanwhile doesn't
 * shift later pages.
 */
export async function listMailThreads(
  scope: MailScope,
  options: {
    view: MailThreadListView;
    cursor?: string | null;
    query?: string;
    limit?: number;
  },
): Promise<MailThreadPage> {
  const limit = options.limit ?? MAIL_THREAD_PAGE_SIZE;
  const after = decodeMailCursor(options.cursor);
  const query = options.query?.trim();
  const filters: Prisma.MailThreadWhereInput[] = [];
  if (options.view === "starred") {
    filters.push({ messages: { some: { isStarred: true } } });
  } else if (options.view !== "recent") {
    filters.push({ messages: { some: { folder: options.view } } });
  }
  if (query) {
    filters.push({
      OR: [
        { subject: { contains: query, mode: "insensitive" } },
        {
          messages: {
            some: {
              OR: [
                { fromAddress: { contains: query, mode: "insensitive" } },
                { fromName: { contains: query, mode: "insensitive" } },
              ],
            },
          },
        },
      ],
    });
  }
  if (after) {
    filters.push({
      OR: [
        { lastMessageAt: { lt: after.at } },
        { lastMessageAt: after.at, id: { lt: after.id } },
      ],
    });
  }
  const rows = await prisma.mailThread.findMany({
    where: { mailbox: mailboxScope(scope), AND: filters },
    select: {
      id: true,
      mailboxId: true,
      mailbox: { select: { address: true } },
      subject: true,
      status: true,
      lastMessageAt: true,
      assignedTo: { select: { name: true } },
    },
    orderBy: [{ lastMessageAt: "desc" }, { id: "desc" }],
    take: limit + 1,
  });
  const page = rows.slice(0, limit);
  const folder =
    options.view === "starred" || options.view === "recent"
      ? null
      : options.view;
  const latest = await latestMessages(
    page.map((row) => row.id),
    folder,
  );
  const last = page.at(-1);
  return {
    threads: page.map((row) => {
      const message = latest.get(row.id);
      return {
        id: row.id,
        mailboxId: row.mailboxId,
        mailboxAddress: row.mailbox.address,
        subject: row.subject,
        status: row.status,
        assignedTo: row.assignedTo?.name,
        lastMessageAt: row.lastMessageAt.toISOString(),
        latestMessageId: message?.id,
        unread: message ? !message.isRead : false,
        starred: message?.isStarred ?? false,
        preview: message?.preview || "No message preview",
        // Your own message names who it went to, not you.
        correspondent:
          message?.direction === "outbound"
            ? (message.toAddresses[0] ?? "No recipient")
            : (message?.fromAddress ?? "Unknown sender"),
        correspondentName:
          message?.direction === "outbound"
            ? undefined
            : (message?.fromName ?? undefined),
      } satisfies MailThreadSummary;
    }),
    nextCursor:
      rows.length > limit && last
        ? encodeMailCursor(last.lastMessageAt, last.id)
        : null,
  };
}

type LatestMessage = {
  threadId: string;
  id: string;
  direction: string;
  fromName: string | null;
  fromAddress: string;
  toAddresses: string[];
  isRead: boolean;
  isStarred: boolean;
  preview: string;
};

/**
 * Each thread's newest message (within `folder` when given, so an inbox row
 * shows what arrived, not your reply), with a whitespace-collapsed 180-char
 * preview. Starred means any message in the thread is, as the Starred view
 * counts it.
 */
async function latestMessages(
  threadIds: string[],
  folder: string | null,
): Promise<Map<string, LatestMessage>> {
  if (!threadIds.length) return new Map();
  const rows = await prisma.$queryRaw<LatestMessage[]>`
    SELECT t.id AS "threadId", m.id, m.direction, m."fromName", m."fromAddress",
      m."toAddresses", m."isRead",
      EXISTS (
        SELECT 1 FROM mail_messages s WHERE s."threadId" = t.id AND s."isStarred"
      ) AS "isStarred",
      left(regexp_replace(coalesce(m."textBody", ''), '\\s+', ' ', 'g'), 180) AS preview
    FROM unnest(${threadIds}::text[]) AS t(id)
    CROSS JOIN LATERAL (
      SELECT id, direction, "fromName", "fromAddress", "toAddresses", "isRead", "textBody"
      FROM mail_messages
      WHERE "threadId" = t.id AND (${folder}::text IS NULL OR folder = ${folder})
      ORDER BY "createdAt" DESC
      LIMIT 1
    ) m`;
  return new Map(rows.map((row) => [row.threadId, row]));
}

/** A thread's messages, oldest first, for the reader. Loaded when it opens. */
export async function mailThreadMessages(
  viewerId: string,
  threadId: string,
): Promise<MailMessageDetail[]> {
  const thread = await prisma.mailThread.findUnique({
    where: { id: threadId },
    select: { mailboxId: true },
  });
  if (!thread) throw new NotFoundError("Conversation not found");
  await accessibleMailbox(viewerId, thread.mailboxId, "read");
  const messages = await prisma.mailMessage.findMany({
    where: { threadId },
    include: { attachments: true },
    orderBy: { createdAt: "asc" },
    take: 200,
  });
  return messages.map((message) => mapMessage(message)[1]);
}

/** One page of the email log: every message's delivery state, newest first. */
export async function listMailLog(
  scope: MailScope,
  cursor?: string | null,
): Promise<MailLogPage> {
  const after = decodeMailCursor(cursor);
  const rows = await prisma.mailMessage.findMany({
    where: {
      mailbox: mailboxScope(scope),
      ...(after
        ? {
            OR: [
              { createdAt: { lt: after.at } },
              { createdAt: after.at, id: { lt: after.id } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      subject: true,
      direction: true,
      fromAddress: true,
      status: true,
      createdAt: true,
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: MAIL_LOG_PAGE_SIZE + 1,
  });
  const page = rows.slice(0, MAIL_LOG_PAGE_SIZE);
  const last = page.at(-1);
  return {
    items: page.map((row) => ({
      id: row.id,
      name: row.subject,
      detail: `${row.direction} · ${row.fromAddress}`,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
    })),
    nextCursor:
      rows.length > MAIL_LOG_PAGE_SIZE && last
        ? encodeMailCursor(last.createdAt, last.id)
        : null,
  };
}
