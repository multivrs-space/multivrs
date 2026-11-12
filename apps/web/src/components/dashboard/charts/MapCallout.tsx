import { formatCompact } from "@/components/dashboard/lib/format";

interface MapCalloutProps {
  x: number;
  y: number;
  name: string;
  value: number;
  unit: string;
  /** User units per screen pixel, so the callout keeps its size at any zoom. */
  scale: number;
  /** Put the card to the left of the marker near the right edge. */
  flip: boolean;
  primary: boolean;
}

/**
 * A country marker with a small card: "2.1K requests / Nigeria". The marker
 * sits on the country's mainland centre; it names a country, never a city.
 */
export function MapCallout({
  x,
  y,
  name,
  value,
  unit,
  scale,
  flip,
  primary,
}: MapCalloutProps) {
  const font = 11 * scale;
  const pad = 7 * scale;
  const headline = `${formatCompact(value)} ${unit}`;
  const width =
    Math.max(headline.length * 0.6, name.length * 0.56) * font + pad * 2;
  const height = font * 2.5 + pad * 2;
  const gap = 10 * scale;
  const cardX = flip ? x - gap - width : x + gap;
  const cardY = y - height - gap * 0.4;

  return (
    <g>
      {primary ? (
        <circle
          className="origin-center animate-ping fill-primary/30 [transform-box:fill-box] motion-reduce:animate-none"
          cx={x}
          cy={y}
          r={7 * scale}
        />
      ) : null}
      <circle className="fill-ink" cx={x} cy={y} r={4.5 * scale} />
      <circle
        className={primary ? "fill-primary" : "fill-foreground"}
        cx={x}
        cy={y}
        r={2.6 * scale}
      />
      <line
        className="stroke-foreground/30"
        strokeWidth={scale}
        x1={x}
        x2={flip ? cardX + width : cardX}
        y1={y}
        y2={cardY + height}
      />
      <rect
        className="fill-ink stroke-hairline-strong"
        height={height}
        rx={6 * scale}
        strokeWidth={scale}
        width={width}
        x={cardX}
        y={cardY}
      />
      <text
        className="fill-foreground font-semibold"
        fontSize={font}
        x={cardX + pad}
        y={cardY + pad + font * 0.9}
      >
        {headline}
      </text>
      <text
        className="fill-muted-foreground"
        fontSize={font * 0.92}
        x={cardX + pad}
        y={cardY + pad + font * 2.1}
      >
        {name}
      </text>
    </g>
  );
}
