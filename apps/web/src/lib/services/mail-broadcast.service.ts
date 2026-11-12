import "server-only";
import { randomUUID } from "node:crypto";
import { ConflictError, NotFoundError } from "@multivrs/error-utils";
import type { z } from "zod";
import { broadcastHtml } from "@/lib/mail/broadcast-html";
import { prisma } from "@/lib/prisma";
import type { createMailBroadcastSchema } from "@/lib/schemas/mail-resource.schemas";
import { mailAccount } from "@/lib/services/mail-access.service";

type BroadcastInput = z.infer<typeof createMailBroadcastSchema>;

/**
 * A new broadcast: saved as a draft, scheduled, or (the default) due now,
 * in which case the caller starts sending it straight away.
 */
export async function createBroadcast(actorId: string, input: BroadcastInput) {
  const { ownerId: userId } = await mailAccount(actorId, input);
  const [audience, version] = await Promise.all([
    input.audienceId
      ? prisma.mailAudience.findFirst({
          where: { id: input.audienceId, userId },
          select: { id: true },
        })
      : null,
    input.templateVersionId
      ? prisma.mailTemplateVersion.findFirst({
          where: { id: input.templateVersionId, template: { userId } },
          select: { id: true },
        })
      : null,
  ]);
  if (input.audienceId && !audience)
    throw new NotFoundError("Segment not found");
  if (input.templateVersionId && !version)
    throw new NotFoundError("Template not found");
  return prisma.$transaction(async (tx) => {
    let templateVersionId = input.templateVersionId;
    if (!templateVersionId) {
      const template = await tx.mailTemplate.create({
        data: {
          userId,
          projectId: input.projectId,
          name: `${input.name} · ${randomUUID().slice(0, 8)}`,
          status: "active",
          versions: {
            create: {
              version: 1,
              subject: input.subject,
              html: broadcastHtml(input.body),
              text: input.body,
              variables: [],
            },
          },
        },
        include: { versions: true },
      });
      templateVersionId = template.versions[0]?.id;
    }
    return tx.mailBroadcast.create({
      data: {
        userId,
        projectId: input.projectId,
        name: input.name,
        subject: input.subject,
        fromAddress: input.fromAddress,
        audienceId: input.audienceId ?? null,
        templateVersionId,
        scheduledAt: input.draft
          ? null
          : input.scheduledAt
            ? new Date(input.scheduledAt)
            : new Date(),
        status: input.draft ? "draft" : "scheduled",
      },
    });
  });
}

/** A broadcast the person can manage, in any account they work in. */
async function managedBroadcast(actorId: string, broadcastId: string) {
  const broadcast = await prisma.mailBroadcast.findUnique({
    where: { id: broadcastId },
    select: {
      id: true,
      userId: true,
      projectId: true,
      status: true,
      user: { select: { username: true } },
    },
  });
  if (!broadcast) throw new NotFoundError("Broadcast not found");
  const { ownerId } = await mailAccount(actorId, {
    projectId: broadcast.projectId,
    account: broadcast.user.username,
  });
  if (ownerId !== broadcast.userId)
    throw new NotFoundError("Broadcast not found");
  return broadcast;
}

/** Send a draft, or retry one that failed before any copy went out. */
export async function sendBroadcastNow(actorId: string, broadcastId: string) {
  const broadcast = await managedBroadcast(actorId, broadcastId);
  if (!["draft", "failed"].includes(broadcast.status))
    throw new ConflictError("This broadcast is already sending or sent");
  return prisma.mailBroadcast.update({
    where: { id: broadcast.id },
    data: { status: "scheduled", scheduledAt: new Date(), stats: {} },
  });
}

/** Drafts and failed broadcasts can be removed; sent ones are history. */
export async function deleteBroadcast(actorId: string, broadcastId: string) {
  const broadcast = await managedBroadcast(actorId, broadcastId);
  if (!["draft", "failed", "scheduled"].includes(broadcast.status))
    throw new ConflictError(
      "A broadcast that has started sending can't be deleted",
    );
  await prisma.mailBroadcast.delete({ where: { id: broadcast.id } });
}
