import { CatmullRomCurve3, Vector3 } from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import type { IconPart } from "@/components/icons/animated";

export interface GlyphStroke {
  id: string;
  curve: CatmullRomCurve3;
  closed: boolean;
  start: Vector3;
  end: Vector3;
}

export interface GlyphGeometry {
  strokes: GlyphStroke[];
  /** Zero-length strokes such as the dot in "!", drawn as spheres. */
  dots: { id: string; at: Vector3 }[];
}

/** Glyph space: the 24-unit icon box mapped onto ±`extent`, y up. */
function toScene(x: number, y: number, extent: number, z: number): Vector3 {
  return new Vector3(((x - 12) / 12) * extent, (-(y - 12) / 12) * extent, z);
}

function partMarkup(part: IconPart): string {
  if (part.el === "g") return part.parts.map(partMarkup).join("");
  if (part.el === "path") return `<path d="${part.d}"/>`;
  if (part.el === "polyline") return `<polyline points="${part.points}"/>`;
  if (part.el === "circle") {
    return `<circle cx="${part.cx}" cy="${part.cy}" r="${part.r}"/>`;
  }
  return `<rect x="${part.x}" y="${part.y}" width="${part.width}" height="${part.height}" rx="${part.rx ?? 0}"/>`;
}

/**
 * Turn an animated icon's parts into 3D stroke curves, so the glyph on a 3D
 * tile is exactly the icon from the sidebar, drawn as round tubes.
 */
export function buildGlyphGeometry(
  parts: readonly IconPart[],
  extent: number,
  z: number,
): GlyphGeometry {
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${parts.map(partMarkup).join("")}</svg>`;
  const data = new SVGLoader().parse(markup);
  const strokes: GlyphStroke[] = [];
  const dots: GlyphGeometry["dots"] = [];

  for (const shapePath of data.paths) {
    for (const subPath of shapePath.subPaths) {
      const flat = subPath.getPoints(24);
      const points: Vector3[] = [];
      for (const point of flat) {
        const next = toScene(point.x, point.y, extent, z);
        const previous = points.at(-1);
        if (!previous || next.distanceTo(previous) > 1e-4) points.push(next);
      }
      const first = points[0];
      const lastPoint = points.at(-1);
      if (!first || !lastPoint) continue;
      const closed = subPath.autoClose || first.distanceTo(lastPoint) < 1e-3;
      if (closed && points.length > 1 && first.distanceTo(lastPoint) < 1e-3) {
        points.pop();
      }
      const last = points.at(-1);
      if (points.length < 2 || !last) {
        dots.push({ id: `dot-${dots.length}`, at: first });
        continue;
      }
      strokes.push({
        id: `stroke-${strokes.length}`,
        curve: new CatmullRomCurve3(points, closed, "centripetal", 0.1),
        closed,
        start: first,
        end: last,
      });
    }
  }
  return { strokes, dots };
}
