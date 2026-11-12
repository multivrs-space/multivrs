import {
  type CountryValue,
  countryCentre,
  drawableCountries,
  intensity,
  trafficViewBox,
} from "@/features/dashboard/lib/world-map";
import { WORLD_MAP_SIZE } from "@/features/dashboard/lib/world-map.data";

/** Every country rests on a thin slab; traffic raises it by up to this. */
export const BASE_HEIGHT = 1.6;
export const MAX_RISE = 34;

/** How tall and how lit a country is: 0 for none, 1 for the busiest. */
export function countryLevels(
  items: readonly CountryValue[],
): Map<string, number> {
  const countries = drawableCountries(items);
  const max = countries[0]?.value ?? 0;
  return new Map(
    countries.map((item) => [item.code, intensity(item.value, max)]),
  );
}

export function countryHeight(level: number): number {
  return BASE_HEIGHT + MAX_RISE * level;
}

/** A country's centre in scene units: x east, z south, map centred on 0. */
export function scenePoint(code: string): [number, number] | null {
  const centre = countryCentre(code);
  if (!centre) return null;
  return [
    centre.x - WORLD_MAP_SIZE.width / 2,
    centre.y - WORLD_MAP_SIZE.height / 2,
  ];
}

/**
 * Where the camera sits and looks: above and south of the busiest region,
 * tilted about 50° so the extrusions read, far enough to frame it whole.
 */
export function cameraFraming(items: readonly CountryValue[], aspect: number) {
  const view = trafficViewBox(items);
  // Aim at the traffic's centre of mass, so the busiest country sits in
  // the middle of the stage, clear of the cards around the edges.
  const [cx, cz] = trafficCentre(items) ?? [
    view.x + view.width / 2 - WORLD_MAP_SIZE.width / 2,
    view.y + view.height / 2 - WORLD_MAP_SIZE.height / 2,
  ];
  // Horizontal half-angle for a 30° vertical field of view.
  const half = Math.atan(Math.tan((15 * Math.PI) / 180) * Math.max(aspect, 1));
  const distance = (view.width * 0.56) / Math.tan(half);
  const tilt = (50 * Math.PI) / 180;
  return {
    target: [cx, 0, cz] as const,
    position: [
      cx,
      distance * Math.sin(tilt),
      cz + distance * Math.cos(tilt),
    ] as const,
    span: view.width,
  };
}

/** Value-weighted centre of the countries that carry most of the traffic. */
export function trafficCentre(
  items: readonly CountryValue[],
): [number, number] | null {
  const leaders = drawableCountries(items).slice(0, 8);
  let weight = 0;
  let x = 0;
  let z = 0;
  for (const item of leaders) {
    const point = scenePoint(item.code);
    if (!point) continue;
    weight += item.value;
    x += point[0] * item.value;
    z += point[1] * item.value;
  }
  return weight ? [x / weight, z / weight] : null;
}
