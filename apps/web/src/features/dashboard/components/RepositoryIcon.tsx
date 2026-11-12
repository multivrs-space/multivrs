import type { FrameworkId } from "@multivrs/config";
import Image from "next/image";
import { FRAMEWORK_LABELS } from "@/features/dashboard/constants/framework-labels";
import {
  FRAMEWORK_ICONS,
  LANGUAGE_ICONS,
} from "@/features/dashboard/constants/stack-icons";

const ICON_SIZE = 18;

/** Framework logo when detected, else the language logo, else the initial. */
export function RepositoryIcon({
  framework,
  language,
  name,
  size = "md",
}: {
  framework: FrameworkId | null | undefined;
  language: string | null;
  name: string;
  /** `lg` for page heroes. */
  size?: "md" | "lg";
}) {
  const icon =
    (framework ? FRAMEWORK_ICONS[framework] : undefined) ??
    (language ? LANGUAGE_ICONS[language] : undefined);
  const label = framework ? FRAMEWORK_LABELS[framework] : (language ?? name);
  return (
    <span
      title={label}
      className={
        size === "lg"
          ? "surface-raised grid size-12 shrink-0 place-items-center rounded-tile text-sm font-semibold uppercase text-foreground/80 [&_img]:size-6!"
          : "surface-inset grid size-8 shrink-0 place-items-center rounded-[9px] text-xs font-semibold uppercase text-foreground/80"
      }
    >
      {icon ? (
        <>
          <Image
            src={icon.light}
            alt={label}
            width={ICON_SIZE}
            height={ICON_SIZE}
            className={
              icon.dark
                ? "size-[18px] object-contain dark:hidden"
                : "size-[18px] object-contain"
            }
            unoptimized
          />
          {icon.dark ? (
            <Image
              src={icon.dark}
              alt=""
              width={ICON_SIZE}
              height={ICON_SIZE}
              className="hidden size-[18px] object-contain dark:block"
              unoptimized
            />
          ) : null}
        </>
      ) : (
        name[0]
      )}
    </span>
  );
}
