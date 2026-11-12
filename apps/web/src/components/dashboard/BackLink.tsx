import Link from "next/link";
import { LiveArrowLeft } from "@/components/icons/animated";

/** The quiet pill above a page title that leads one level up. */
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      className="inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
      data-icon-trigger
      href={href}
    >
      <LiveArrowLeft className="size-3.5" strokeWidth={2} />
      {label}
    </Link>
  );
}
