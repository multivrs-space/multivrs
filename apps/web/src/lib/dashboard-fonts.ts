import localFont from "next/font/local";

/*
 * Self-hosted (Latin, variable weight) rather than fetched from Google at
 * build time: a build then never depends on Google answering, or on the
 * shape of the URLs it hands out.
 */

export const hankenGrotesk = localFont({
  src: "../fonts/hanken-grotesk.woff2",
  variable: "--font-hanken",
  weight: "100 900",
  display: "swap",
});

export const geistMono = localFont({
  src: "../fonts/geist-mono.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});
