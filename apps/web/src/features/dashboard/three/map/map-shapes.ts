import { Path, Shape } from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import {
  WORLD_MAP_SIZE,
  WORLD_MAP_SRC,
} from "@/features/dashboard/lib/world-map.data";

export interface CountryShapes {
  code: string;
  shapes: Shape[];
}

let cache: Promise<CountryShapes[]> | null = null;

/**
 * Turn an SVG outline into a shape centred on the map, with north as +y,
 * so after laying it flat north runs away from the camera.
 */
function centred(shape: Shape): Shape {
  const { width, height } = WORLD_MAP_SIZE;
  const flip = (point: { x: number; y: number }) =>
    [point.x - width / 2, height / 2 - point.y] as const;
  const { shape: outline, holes } = shape.extractPoints(1);
  const next = new Shape();
  outline.forEach((point, index) => {
    const [x, y] = flip(point);
    if (index === 0) next.moveTo(x, y);
    else next.lineTo(x, y);
  });
  for (const hole of holes) {
    const path = new Path();
    hole.forEach((point, index) => {
      const [x, y] = flip(point);
      if (index === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    });
    next.holes.push(path);
  }
  return next;
}

/** Every country's outline from the same static SVG the flat map uses, once per page. */
export function loadCountryShapes(): Promise<CountryShapes[]> {
  cache ??= fetch(WORLD_MAP_SRC)
    .then((response) => response.text())
    .then((text) =>
      new SVGLoader().parse(text).paths.flatMap((path) => {
        const node = path.userData?.node;
        const code = node instanceof Element ? node.getAttribute("id") : null;
        if (!code || code === "world") return [];
        return [{ code, shapes: SVGLoader.createShapes(path).map(centred) }];
      }),
    );
  return cache;
}
