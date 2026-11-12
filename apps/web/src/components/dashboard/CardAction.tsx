import Link from "next/link";
import { LiveArrowUpRight } from "@/components/icons/animated";
import { cn } from "@/lib/utils";

type CardActionProps = {
  /** What the action opens, for screen readers and the tooltip. */
  label: string;
  className?: string;
} & ({ href: string; onClick?: never } | { href?: never; onClick: () => void });

const CLASSES =
  "surface-raised surface-press flex size-8 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring";

/** The round ↗ key in a card's corner that opens the full view. */
export function CardAction({
  href,
  onClick,
  label,
  className,
}: CardActionProps) {
  const icon = <LiveArrowUpRight className="size-3.5" strokeWidth={2} />;
  if (href === undefined) {
    return (
      <button
        aria-label={label}
        className={cn(CLASSES, className)}
        data-icon-trigger
        onClick={onClick}
        title={label}
        type="button"
      >
        {icon}
      </button>
    );
  }
  return (
    <Link
      aria-label={label}
      className={cn(CLASSES, className)}
      data-icon-trigger
      href={href}
      title={label}
    >
      {icon}
    </Link>
  );
}
