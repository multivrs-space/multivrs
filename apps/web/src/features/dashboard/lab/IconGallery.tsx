import type { AnimatedIcon } from "@/components/icons/animated";
import * as Icons from "@/components/icons/animated";

function isAnimatedIcon(value: unknown): value is AnimatedIcon {
  return typeof value === "function" && "iconName" in value && "parts" in value;
}

const ICONS = Object.entries(Icons).flatMap(([name, value]) =>
  isAnimatedIcon(value) ? [{ name, Icon: value }] : [],
);

/** Every animated icon in a hover tile, to tune motions side by side. */
export function IconGallery() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(132px,1fr))] gap-2">
      {ICONS.map(({ name, Icon }) => (
        <button
          className="surface-card surface-press flex flex-col items-center gap-3 rounded-tile px-3 py-5 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          data-icon-trigger
          key={name}
          type="button"
        >
          <Icon className="size-7" strokeWidth={1.5} />
          <span className="font-geist-mono text-[10px]">
            {name.replace("Live", "")}
          </span>
        </button>
      ))}
    </div>
  );
}

export const ICON_COUNT = ICONS.length;
