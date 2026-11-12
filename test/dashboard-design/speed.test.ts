import { describe, expect, test } from "bun:test";
import { smoothPath } from "../../apps/web/src/components/dashboard/lib/chart-math";
import {
  experienceScore,
  formatVital,
  scoreVerdict,
  vitalRating,
} from "../../apps/web/src/features/dashboard/lib/web-vitals";

describe("monotone curves", () => {
  test("control points never leave the data's vertical range", () => {
    const points = [
      { x: 0, y: 100 },
      { x: 10, y: 0 },
      { x: 20, y: 100 },
      { x: 30, y: 100 },
      { x: 40, y: 0 },
    ];
    const numbers = smoothPath(points)
      .replace(/[MC]/g, " ")
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    const ys = numbers.filter((_, index) => index % 2 === 1);
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...ys)).toBeLessThanOrEqual(100);
  });
});

describe("web vitals", () => {
  test("rates against Google's thresholds", () => {
    expect(vitalRating("LCP", 2500)).toBe("good");
    expect(vitalRating("LCP", 3000)).toBe("needs-improvement");
    expect(vitalRating("INP", 600)).toBe("poor");
    expect(vitalRating("CLS", 0.05)).toBe("good");
  });

  test("formats milliseconds, seconds and layout shift", () => {
    expect(formatVital("INP", 180.4)).toBe("180 ms");
    expect(formatVital("LCP", 2140)).toBe("2.14 s");
    expect(formatVital("CLS", 0.1234)).toBe("0.123");
    expect(formatVital("TTFB", undefined)).toBe("—");
  });

  test("experience score weights good share by samples and ignores TTFB", () => {
    expect(experienceScore([])).toBeNull();
    expect(
      experienceScore([
        { name: "LCP", value: 2000, goodRate: 100, samples: 300 },
        { name: "INP", value: 300, goodRate: 50, samples: 100 },
        { name: "TTFB", value: 2000, goodRate: 0, samples: 1000 },
      ]),
    ).toBe(88);
    expect(scoreVerdict(92)).toBe("Great");
    expect(scoreVerdict(40)).toBe("Poor");
  });
});
