import type { FrameworkId } from "@multivrs/config";
import { FRAMEWORK_LABELS } from "@/features/dashboard/constants/framework-labels";
import { FRAMEWORK_ICONS } from "@/features/dashboard/constants/stack-icons";
import { cn } from "@/lib/utils";

/** A framework's logo at text size, or its initial when none is bundled. */
export function FrameworkLogo({
  framework,
  className,
}: {
  framework: FrameworkId;
  className?: string;
}) {
  const icon = FRAMEWORK_ICONS[framework];
  if (!icon)
    return (
      <span
        aria-hidden="true"
        className={cn(
          "grid size-4 shrink-0 place-items-center rounded-[4px] bg-foreground/10 text-[9px] font-semibold uppercase text-foreground/70",
          className,
        )}
      >
        {FRAMEWORK_LABELS[framework][0]}
      </span>
    );
  return (
    <span className={cn("relative size-4 shrink-0", className)}>
      {/* biome-ignore lint/performance/noImgElement: tiny local SVGs need no optimisation */}
      <img
        alt=""
        className={cn(
          "size-full object-contain",
          icon.dark ? "dark:hidden" : null,
        )}
        height={16}
        src={icon.light}
        width={16}
      />
      {icon.dark ? (
        // biome-ignore lint/performance/noImgElement: tiny local SVGs need no optimisation
        <img
          alt=""
          className="hidden size-full object-contain dark:block"
          height={16}
          src={icon.dark}
          width={16}
        />
      ) : null}
    </span>
  );
}
