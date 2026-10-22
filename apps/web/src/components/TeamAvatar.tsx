import Image from "next/image";
import { cn } from "@/lib/utils";

export interface TeamAvatarProps {
  /** Team or workspace name / slug, used for the initial letter fallback */
  name?: string | null;
  /** Custom logo or image URL */
  logo?: string | null;
  /** Alias for logo (used in workspace objects) */
  image?: string | null;
  /** Size in pixels (width and height). Defaults to 24 */
  size?: number;
  /** Extra CSS classes applied to the root element */
  className?: string;
  /** Optional children (such as an upload overlay) */
  children?: React.ReactNode;
  /** Accessible alt / aria label override */
  alt?: string;
}

function getFontSize(size: number): string {
  if (size <= 16) return "9px";
  if (size <= 18) return "10px";
  if (size <= 20) return "11px";
  if (size <= 24) return "12px";
  if (size <= 28) return "12.5px";
  if (size <= 32) return "13.5px";
  if (size <= 40) return "16px";
  if (size <= 48) return "18px";
  if (size <= 64) return "24px";
  return "32px";
}

/**
 * Unified Team Avatar component.
 *
 * Provides a single, consistent default template across the entire application
 * (Sidebar header, Workspace switcher, Pricing sheet, Team settings, User settings, etc.).
 *
 * If a custom logo/image is present, renders the image.
 * Otherwise, renders the unified brand purple-indigo gradient with the team initial letter.
 */
export function TeamAvatar({
  name,
  logo,
  image,
  size = 24,
  className,
  children,
  alt,
}: TeamAvatarProps) {
  const imgSrc = logo || image;
  const style = { width: size, height: size };

  if (imgSrc) {
    return (
      <div
        style={style}
        className={cn(
          "relative flex shrink-0 items-center justify-center rounded-full overflow-hidden border border-zinc-800 bg-zinc-900 shadow-xs",
          className
        )}
      >
        <Image
          src={imgSrc}
          alt={alt || (name ? `${name} logo` : "Team logo")}
          width={size}
          height={size}
          unoptimized
          className="size-full object-cover"
        />
        {children}
      </div>
    );
  }

  const trimmed = name?.trim();
  const initial = (trimmed?.[0] ?? "T").toUpperCase();

  return (
    <div
      style={{ ...style, fontSize: getFontSize(size) }}
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full bg-linear-to-br from-purple-600 via-purple-700 to-indigo-800 font-geist-mono font-bold text-white uppercase select-none leading-none shadow-xs ring-1 ring-white/15 overflow-hidden",
        className
      )}
      aria-label={alt || (name ? `${name} team` : "Default team")}
    >
      <span>{initial}</span>
      {children}
    </div>
  );
}
