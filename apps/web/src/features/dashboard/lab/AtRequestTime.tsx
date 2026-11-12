import { connection } from "next/server";
import type { ReactNode } from "react";

/** Renders its children per request, for lab samples that read the clock. */
export async function AtRequestTime({ children }: { children: ReactNode }) {
  await connection();
  return children;
}
