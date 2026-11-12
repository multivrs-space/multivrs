import type { DeploymentCreator } from "@/features/dashboard/types/deployment-creator.types";

/** Prisma `include` for a deployment's creator: only what the UI shows. */
export const CREATOR_INCLUDE = {
  select: { name: true, displayUsername: true, username: true, image: true },
} as const;

export function toCreator(
  user: {
    name: string;
    displayUsername: string | null;
    username: string | null;
    image: string | null;
  } | null,
): DeploymentCreator | null {
  if (!user) return null;
  return {
    name: user.displayUsername ?? user.username ?? user.name,
    avatarUrl: user.image,
  };
}
