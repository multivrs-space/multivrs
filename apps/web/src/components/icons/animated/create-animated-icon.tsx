import { createElement, type ReactElement } from "react";
import type {
  AnimatedIcon,
  AnimatedIconProps,
  IconPart,
  IconShape,
  PartMotion,
} from "@/components/icons/animated/animated-icon.types";
import { cn } from "@/lib/utils";

/** Shorthand builders so icon files read like the SVG they describe. */
export const path = (d: string, motion: PartMotion = {}): IconPart => ({
  el: "path",
  d,
  ...motion,
});

export const rect = (
  x: number,
  y: number,
  width: number,
  height: number,
  rx: number,
  motion: PartMotion = {},
): IconPart => ({ el: "rect", x, y, width, height, rx, ...motion });

export const circle = (
  cx: number,
  cy: number,
  r: number,
  motion: PartMotion = {},
  filled = false,
): IconPart => ({
  el: "circle",
  cx,
  cy,
  r,
  ...(filled ? { fill: "currentColor" as const } : {}),
  ...motion,
});

export const polyline = (
  points: string,
  motion: PartMotion = {},
): IconPart => ({
  el: "polyline",
  points,
  ...motion,
});

export const group = (
  parts: IconPart[],
  motion: PartMotion = {},
): IconPart => ({
  el: "g",
  parts,
  ...motion,
});

function motionAttributes({ motion, origin, delay }: PartMotion) {
  if (!motion) return {};
  return {
    "data-motion": motion,
    "data-origin": origin ?? "c",
    "data-delay": delay,
  };
}

function renderPart(part: IconPart, index: number): ReactElement {
  if (part.el === "g") {
    return (
      <g key={index} {...motionAttributes(part)}>
        {part.parts.map(renderPart)}
      </g>
    );
  }
  const { motion, origin, delay, ...shape } = part;
  const { el, ...attributes }: IconShape = shape;
  return createElement(el, {
    key: index,
    ...attributes,
    ...motionAttributes({ motion, origin, delay }),
    pathLength: motion === "draw" ? 1 : undefined,
  });
}

/**
 * Build a Lucide-compatible icon whose parts animate on hover of the nearest
 * `[data-icon-trigger]` ancestor (or the icon itself), and once when that
 * ancestor becomes `aria-current="page"`. Pure SVG + CSS, so it renders in
 * Server Components and costs no JavaScript.
 */
export function createAnimatedIcon(
  iconName: string,
  parts: IconPart[],
): AnimatedIcon {
  function Icon({
    size = 24,
    strokeWidth = 2,
    className,
    ...props
  }: AnimatedIconProps) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        data-animated-icon={iconName}
        className={cn("shrink-0 overflow-visible", className)}
        {...props}
      >
        {parts.map(renderPart)}
      </svg>
    );
  }
  Icon.displayName = `AnimatedIcon(${iconName})`;
  Icon.iconName = iconName;
  Icon.parts = parts;
  return Icon;
}
