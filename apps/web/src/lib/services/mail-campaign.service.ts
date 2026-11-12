import "server-only";
import type { z } from "zod";
import { prisma } from "@/lib/prisma";
import type {
  createMailAutomationSchema,
  createMailTemplateSchema,
} from "@/lib/schemas/mail-resource.schemas";
import { mailAccount } from "@/lib/services/mail-access.service";

export async function createTemplate(
  actorId: string,
  input: z.infer<typeof createMailTemplateSchema>,
) {
  const { ownerId: userId } = await mailAccount(actorId, input);
  return prisma.mailTemplate.create({
    data: {
      name: input.name,
      projectId: input.projectId,
      userId,
      versions: {
        create: {
          version: 1,
          subject: input.subject,
          previewText: input.previewText,
          html: input.html,
          text: input.text,
          variables: input.variables,
        },
      },
    },
    include: { versions: true },
  });
}

export async function createAutomation(
  actorId: string,
  input: z.infer<typeof createMailAutomationSchema>,
) {
  const { account: _, ...fields } = input;
  const { ownerId } = await mailAccount(actorId, input);
  return prisma.mailAutomation.create({
    data: { ...fields, userId: ownerId },
  });
}
