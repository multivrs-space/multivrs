import type { JSX, SVGProps } from "react";

/**
 * Motions an icon part can play. Each maps to a keyframe in
 * `src/app/living-icons.css`; parts move inside the icon, the icon never
 * scales or shifts as a whole.
 */
export type IconMotion =
  | "draw"
  | "pop"
  | "grow"
  | "turn"
  | "quarter"
  | "half"
  | "spin"
  | "swing"
  | "shake"
  | "flap"
  | "squash"
  | "lift"
  | "sink"
  | "nudge-r"
  | "nudge-l"
  | "launch"
  | "exit-ne"
  | "exit-w"
  | "blink"
  | "wink"
  | "flicker"
  | "scan"
  | "rise"
  | "twinkle"
  | "drift";

/** Transform origin within the part's own box; `icon` pivots on the icon centre. */
export type IconOrigin =
  | "c"
  | "t"
  | "b"
  | "l"
  | "r"
  | "tl"
  | "tr"
  | "bl"
  | "br"
  | "icon";

export type IconDelay = 1 | 2 | 3 | 4;

export interface PartMotion {
  motion?: IconMotion;
  origin?: IconOrigin;
  delay?: IconDelay;
}

export type IconShape =
  | { el: "path"; d: string }
  | {
      el: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
      rx?: number;
    }
  | { el: "circle"; cx: number; cy: number; r: number; fill?: "currentColor" }
  | { el: "polyline"; points: string };

export type IconPart =
  | (IconShape & PartMotion)
  | ({ el: "g"; parts: IconPart[] } & PartMotion);

export interface AnimatedIconProps
  extends Omit<SVGProps<SVGSVGElement>, "children"> {
  size?: number | string;
  strokeWidth?: number | string;
}

export interface AnimatedIcon {
  (props: AnimatedIconProps): JSX.Element;
  displayName?: string;
  /** Stable icon name, also used to look up its 3D glyph. */
  iconName: string;
  /** The geometry, shared with the 3D glyph so 2D and 3D always match. */
  parts: readonly IconPart[];
}
