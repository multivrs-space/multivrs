"use client";

import { Html } from "@react-three/drei";
import { formatCompact } from "@/components/dashboard/lib/format";
import { countryName } from "@/features/dashboard/lib/world-map";

const STEM = 16;

/** A lit stem above a country with a label card floating at its tip. */
export function MapPin({
  code,
  value,
  unit,
  at,
  top,
  primary,
  rank,
}: {
  code: string;
  value: number;
  unit: string;
  at: [number, number];
  /** Height of the country's surface the stem stands on. */
  top: number;
  primary: string;
  rank: number;
}) {
  return (
    <group position={[at[0], top, at[1]]}>
      <mesh position={[0, STEM / 2, 0]}>
        <cylinderGeometry args={[0.22, 0.22, STEM, 8]} />
        <meshBasicMaterial color={primary} opacity={0.75} transparent />
      </mesh>
      <mesh position={[0, STEM, 0]}>
        <sphereGeometry args={[1.1, 20, 20]} />
        <meshBasicMaterial color={primary} />
      </mesh>
      <Html center position={[0, STEM + 7, 0]} zIndexRange={[20, 0]}>
        <div className="surface-glass pointer-events-none whitespace-nowrap rounded-[12px] px-2.5 py-1.5 font-hanken">
          <p className="text-[12px] font-semibold leading-tight text-foreground">
            <span className="figure">{formatCompact(value)}</span>{" "}
            <span className="font-normal text-muted-foreground">{unit}</span>
          </p>
          <p className="flex items-center gap-1 text-[11px] leading-tight text-muted-foreground">
            <span className="font-geist-mono text-[9.5px] text-primary">
              #{rank}
            </span>
            {countryName(code)}
          </p>
        </div>
      </Html>
    </group>
  );
}
