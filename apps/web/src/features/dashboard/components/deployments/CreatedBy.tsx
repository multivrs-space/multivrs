import type { DeploymentCreator } from "@/features/dashboard/types/deployment-creator.types";
import { cn } from "@/lib/utils";

/** "by Cole" with their avatar, or "by a git push" when no one clicked Deploy. */
export function CreatedBy({
  creator,
  className,
}: {
  creator: DeploymentCreator | null | undefined;
  className?: string;
}) {
  if (!creator)
    return (
      <span className={cn("text-muted-foreground", className)}>
        by a git push
      </span>
    );
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-1.5", className)}>
      by
      {creator.avatarUrl ? (
        // biome-ignore lint/performance/noImgElement: a 16px avatar
        <img
          alt=""
          className="size-4 shrink-0 rounded-full"
          height={16}
          src={creator.avatarUrl}
          width={16}
        />
      ) : (
        <span
          aria-hidden="true"
          className="grid size-4 shrink-0 place-items-center rounded-full bg-primary/15 text-[9px] font-semibold uppercase text-primary"
        >
          {creator.name[0]}
        </span>
      )}
      <span className="truncate font-medium text-foreground">
        {creator.name}
      </span>
    </span>
  );
}
