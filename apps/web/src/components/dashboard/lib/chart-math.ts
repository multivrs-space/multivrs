/** Pure geometry for the server-rendered SVG charts. */

export interface Point {
  x: number;
  y: number;
}

/** Round a maximum up to a readable axis ceiling: 1, 2, 2.5 or 5 × 10ⁿ. */
export function niceCeil(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1;
  const exponent = 10 ** Math.floor(Math.log10(value));
  const fraction = value / exponent;
  const step = [1, 2, 2.5, 5, 10].find((candidate) => fraction <= candidate);
  return (step ?? 10) * exponent;
}

/** `count + 1` evenly spaced ticks from the ceiling down to zero. */
export function axisTicks(ceiling: number, count = 4): number[] {
  return Array.from(
    { length: count + 1 },
    (_, index) => (ceiling * (count - index)) / count,
  );
}

/**
 * Place values across a `width × height` box, one point per bucket centre,
 * with y measured from the top (SVG convention).
 */
export function plotPoints(
  values: readonly number[],
  ceiling: number,
  width: number,
  height: number,
): Point[] {
  if (values.length === 0) return [];
  const step = width / values.length;
  return values.map((value, index) => ({
    x: step * index + step / 2,
    y: height - (Math.max(0, value) / (ceiling || 1)) * height,
  }));
}

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * A smooth curve through points that never overshoots the data (monotone
 * cubic, Fritsch–Carlson), so a line never dips below zero or above a peak.
 */
export function smoothPath(points: readonly Point[]): string {
  const [first] = points;
  if (!first) return "";
  let d = `M${round(first.x)},${round(first.y)}`;
  if (points.length === 1) return d;
  const tangents = monotoneTangents(points);
  for (let index = 0; index < points.length - 1; index++) {
    const p1 = points[index] ?? first;
    const p2 = points[index + 1] ?? p1;
    const h = (p2.x - p1.x) / 3;
    const m1 = tangents[index] ?? 0;
    const m2 = tangents[index + 1] ?? 0;
    d += `C${round(p1.x + h)},${round(p1.y + m1 * h)} ${round(p2.x - h)},${round(p2.y - m2 * h)} ${round(p2.x)},${round(p2.y)}`;
  }
  return d;
}

function monotoneTangents(points: readonly Point[]): number[] {
  const slopes = points.slice(0, -1).map((point, index) => {
    const next = points[index + 1] ?? point;
    const dx = next.x - point.x;
    return dx === 0 ? 0 : (next.y - point.y) / dx;
  });
  const tangents = points.map((_, index) => {
    const before = slopes[index - 1];
    const after = slopes[index];
    if (before === undefined) return after ?? 0;
    if (after === undefined) return before;
    return before * after <= 0 ? 0 : (before + after) / 2;
  });
  slopes.forEach((slope, index) => {
    if (slope === 0) {
      tangents[index] = 0;
      tangents[index + 1] = 0;
      return;
    }
    const a = (tangents[index] ?? 0) / slope;
    const b = (tangents[index + 1] ?? 0) / slope;
    const length = a * a + b * b;
    if (length > 9) {
      const t = 3 / Math.sqrt(length);
      tangents[index] = t * a * slope;
      tangents[index + 1] = t * b * slope;
    }
  });
  return tangents;
}

/** Close a line path down to the baseline so it can be filled as an area. */
export function areaPath(points: readonly Point[], height: number): string {
  const first = points[0];
  const last = points.at(-1);
  if (!first || !last) return "";
  return `${smoothPath(points)}L${round(last.x)},${height}L${round(first.x)},${height}Z`;
}

/** Index of the largest value, or -1 for an empty or all-zero series. */
export function peakIndex(values: readonly number[]): number {
  let best = -1;
  let max = 0;
  values.forEach((value, index) => {
    if (value > max) {
      max = value;
      best = index;
    }
  });
  return best;
}

/** Every `n`th index so roughly `target` labels fit under an axis. */
export function labelStride(length: number, target = 6): number {
  return Math.max(1, Math.ceil(length / target));
}

/**
 * Stable React keys for labels that may repeat (a 24h window can start and
 * end on the same hour): the first "14:00" stays "14:00", the next is
 * "14:00#2".
 */
export function uniqueKeys(labels: readonly string[]): string[] {
  const seen = new Map<string, number>();
  return labels.map((label) => {
    const count = (seen.get(label) ?? 0) + 1;
    seen.set(label, count);
    return count === 1 ? label : `${label}#${count}`;
  });
}
