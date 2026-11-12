"use client";

import { qrModules } from "@/features/dashboard/components/account/auth/totp-qr";

/**
 * The authenticator link as a QR code, drawn as one SVG path. Always dark on
 * white: phone scanners read inverted codes poorly, whatever the theme.
 */
export function TotpQrCode({ uri }: { uri: string }) {
  const { size, path } = qrModules(uri);
  return (
    <svg
      aria-label="QR code to add Multivrs to your authenticator app"
      className="surface-raised size-44 shrink-0 rounded-tile bg-white p-1.5"
      role="img"
      shapeRendering="crispEdges"
      viewBox={`0 0 ${size} ${size}`}
    >
      <path className="fill-neutral-950" d={path} />
    </svg>
  );
}
