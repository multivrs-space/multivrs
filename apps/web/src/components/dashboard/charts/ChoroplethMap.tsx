import { MapCallout } from "@/components/dashboard/charts/MapCallout";
import {
  type CountryValue,
  countryCentre,
  countryName,
  drawableCountries,
  intensity,
  trafficViewBox,
} from "@/features/dashboard/lib/world-map";
import { WORLD_MAP_SRC } from "@/features/dashboard/lib/world-map.data";
import { cn } from "@/lib/utils";

interface ChoroplethMapProps {
  items: readonly CountryValue[];
  /** Noun for the values, e.g. "requests". */
  unit: string;
  className?: string;
  /** How many of the largest countries get a callout. */
  callouts?: number;
}

/**
 * World map shaded by country, framed on where the traffic is. Shapes come
 * from one cached static SVG referenced with <use>, so a page only ships a
 * handful of references, never the geometry.
 */
export function ChoroplethMap({
  items,
  unit,
  className,
  callouts = 2,
}: ChoroplethMapProps) {
  const countries = drawableCountries(items);
  const max = countries[0]?.value ?? 0;
  const view = trafficViewBox(countries);
  // Markers and text keep a steady on-screen size whatever the zoom.
  const scale = view.width / 720;
  const summary = countries
    .slice(0, 5)
    .map((item) => `${countryName(item.code)} ${item.value}`)
    .join(", ");

  return (
    <svg
      aria-label={
        countries.length
          ? `${unit} by country: ${summary}`
          : `No ${unit} by country yet`
      }
      className={cn("size-full", className)}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
    >
      <use
        className="fill-foreground/[0.08] stroke-ink"
        href={`${WORLD_MAP_SRC}#world`}
        strokeWidth={0.6 * scale}
      />
      {countries.map((item) => (
        <use
          className="fill-primary stroke-ink"
          fillOpacity={0.16 + 0.84 * intensity(item.value, max)}
          href={`${WORLD_MAP_SRC}#${item.code}`}
          key={item.code}
          strokeWidth={0.6 * scale}
        >
          <title>{`${countryName(item.code)}: ${item.value.toLocaleString("en")} ${unit}`}</title>
        </use>
      ))}
      {countries.slice(0, callouts).map((item, index) => {
        const centre = countryCentre(item.code);
        if (!centre) return null;
        return (
          <MapCallout
            flip={centre.x > view.x + view.width * 0.62}
            key={item.code}
            name={countryName(item.code)}
            primary={index === 0}
            scale={scale}
            unit={unit}
            value={item.value}
            x={centre.x}
            y={centre.y}
          />
        );
      })}
    </svg>
  );
}
