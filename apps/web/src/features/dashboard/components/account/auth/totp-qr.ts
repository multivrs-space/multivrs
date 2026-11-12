import { encode } from "uqr";

/** The QR grid for a link, plus one SVG path drawing its dark modules. */
export function qrModules(uri: string) {
  const { data, size } = encode(uri, { ecc: "M", border: 2 });
  let path = "";
  data.forEach((row, y) => {
    row.forEach((dark, x) => {
      if (dark) path += `M${x} ${y}h1v1h-1z`;
    });
  });
  return { data, size, path };
}
