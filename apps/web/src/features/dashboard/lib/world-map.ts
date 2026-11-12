import {
  WORLD_COUNTRIES,
  WORLD_MAP_SIZE,
} from "@/features/dashboard/lib/world-map.data";

export interface MapViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CountryValue {
  code: string;
  value: number;
}

const FULL: MapViewBox = { x: 0, y: 0, ...WORLD_MAP_SIZE };
/** Never zoom closer than roughly a continent. */
const MIN_WIDTH = 300;
/** Frame the countries that make up this share of the total. */
const FRAME_SHARE = 0.85;
const MAX_FRAMED = 12;

/** Countries we can draw, largest first. Codes like "T1" (Tor) are dropped. */
export function drawableCountries(
  items: readonly CountryValue[],
): CountryValue[] {
  return items
    .filter((item) => item.value > 0 && WORLD_COUNTRIES[item.code])
    .sort((left, right) => right.value - left.value);
}

/**
 * A viewBox around where most traffic comes from, padded and widened to the
 * map's aspect ratio, so a site with European visitors opens on Europe and a
 * global one shows the world.
 */
export function trafficViewBox(items: readonly CountryValue[]): MapViewBox {
  const drawable = drawableCountries(items);
  const total = drawable.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return FULL;

  const framed: CountryValue[] = [];
  let covered = 0;
  for (const item of drawable) {
    framed.push(item);
    covered += item.value;
    if (covered / total >= FRAME_SHARE || framed.length >= MAX_FRAMED) break;
  }

  const boxes = framed.flatMap((item) => {
    const box = WORLD_COUNTRIES[item.code]?.box;
    return box ? [box] : [];
  });
  let x0 = Math.min(...boxes.map((box) => box[0]));
  let y0 = Math.min(...boxes.map((box) => box[1]));
  let x1 = Math.max(...boxes.map((box) => box[2]));
  let y1 = Math.max(...boxes.map((box) => box[3]));

  const padX = (x1 - x0) * 0.35 + 24;
  const padY = (y1 - y0) * 0.35 + 24;
  x0 -= padX;
  x1 += padX;
  y0 -= padY;
  y1 += padY;

  const aspect = WORLD_MAP_SIZE.width / WORLD_MAP_SIZE.height;
  let width = Math.max(x1 - x0, MIN_WIDTH, (y1 - y0) * aspect);
  let height = width / aspect;
  if (width >= WORLD_MAP_SIZE.width || height >= WORLD_MAP_SIZE.height) {
    return FULL;
  }
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const x = clamp(cx - width / 2, 0, WORLD_MAP_SIZE.width - width);
  const y = clamp(cy - height / 2, 0, WORLD_MAP_SIZE.height - height);
  width = Math.round(width);
  height = Math.round(height);
  return { x: Math.round(x), y: Math.round(y), width, height };
}

/** Fill strength 0–1 on a square-root scale so small countries still show. */
export function intensity(value: number, max: number): number {
  return max > 0 ? Math.sqrt(value / max) : 0;
}

export function countryName(code: string): string {
  return WORLD_COUNTRIES[code]?.name ?? code;
}

export function countryCentre(code: string): { x: number; y: number } | null {
  const box = WORLD_COUNTRIES[code]?.box;
  return box ? { x: (box[0] + box[2]) / 2, y: (box[1] + box[3]) / 2 } : null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
