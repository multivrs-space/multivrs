import Link from "next/link";
import { LiveSparkles } from "@/components/icons/animated";
import { buttonVariants } from "@/components/ui/button-variants";

interface UpsellBannerProps {
  title: string;
  description: string;
  href: string;
  cta: string;
}

/** A single line on what an add-on unlocks, and where to turn it on. */
export function UpsellBanner({
  title,
  description,
  href,
  cta,
}: UpsellBannerProps) {
  return (
    <aside
      className="surface-card relative flex flex-col items-start gap-4 overflow-hidden rounded-card p-5 sm:flex-row sm:items-center"
      data-icon-trigger
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-primary/20 blur-3xl"
      />
      <span className="surface-hero relative grid size-10 shrink-0 place-items-center rounded-tile">
        <LiveSparkles className="size-5" strokeWidth={1.75} />
      </span>
      <div className="relative min-w-0 flex-1">
        <p className="text-[15px] font-semibold tracking-[-0.015em] text-foreground">
          {title}
        </p>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          {description}
        </p>
      </div>
      <Link
        className={`${buttonVariants({ size: "sm", variant: "hero" })} relative`}
        href={href}
      >
        {cta}
      </Link>
    </aside>
  );
}
