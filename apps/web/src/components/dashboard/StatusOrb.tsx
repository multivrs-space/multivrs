import { cn } from "@/lib/utils";

export type OrbTone = "ready" | "building" | "error" | "idle" | "queued";

const TONES: Record<OrbTone, { dot: string; glow: string; text: string }> = {
  ready: {
    dot: "bg-emerald-500",
    glow: "shadow-[0_0_0_3px_rgb(16_185_129/0.2)]",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  building: {
    dot: "bg-amber-500",
    glow: "shadow-[0_0_0_3px_rgb(245_158_11/0.2)]",
    text: "text-amber-700 dark:text-amber-300",
  },
  queued: {
    dot: "bg-muted-foreground",
    glow: "shadow-[0_0_0_3px_color-mix(in_oklab,var(--muted-foreground)_18%,transparent)]",
    text: "text-muted-foreground",
  },
  error: {
    dot: "bg-rose-500",
    glow: "shadow-[0_0_0_3px_rgb(244_63_94/0.2)]",
    text: "text-rose-700 dark:text-rose-300",
  },
  idle: {
    dot: "bg-muted-foreground/40",
    glow: "",
    text: "text-muted-foreground",
  },
};

interface StatusOrbProps {
  tone: OrbTone;
  label: string;
  /** Show the label next to the dot, in a raised pill. */
  pill?: boolean;
  className?: string;
}

/**
 * A status light. Building breathes; everything else is still, so motion on
 * a page always means "something is happening right now".
 */
export function StatusOrb({
  tone,
  label,
  pill = false,
  className,
}: StatusOrbProps) {
  const style = TONES[tone];
  const dot = (
    <span className="relative grid size-2 shrink-0 place-items-center">
      {tone === "building" ? (
        <span className="absolute inset-0 animate-ping rounded-full bg-amber-500/60 motion-reduce:animate-none" />
      ) : null}
      <span
        className={cn("relative size-2 rounded-full", style.dot, style.glow)}
      />
    </span>
  );
  if (!pill) {
    return (
      <span aria-label={label} className={className} role="img" title={label}>
        {dot}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "surface-raised inline-flex h-6 items-center gap-1.5 rounded-full px-2 text-[11px] font-medium",
        style.text,
        className,
      )}
    >
      {dot}
      {label}
    </span>
  );
}
