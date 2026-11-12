import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const WEB = join(import.meta.dir, "../../apps/web/src");
/** What customers see: the dashboard, mail and their shared components. */
const ROOTS = ["features/dashboard", "features/mail", "components/dashboard", "app/(dashboard)"];
/** The infrastructure underneath Multivrs, which customers never need to see. */
const VENDORS = /\b(Cloudflare|SES|AWS|Amazon SES|OpenNext|[Ww]rangler|Analytics Engine|Supabase|Prisma|workers\.dev)\b/;
/** Deliberate mentions: a customer's own AWS account, mail *from* Amazon. */
const ALLOWED = new Set(["features/dashboard/components/IntegrationsPage.tsx", "features/mail/sender-utils.ts"]);

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === "lab" ? [] : files(path);
    return /\.(tsx?|css)$/.test(name) ? [path] : [];
  });
}

describe("white label", () => {
  test("no infrastructure vendor names in customer-facing text", () => {
    const leaks = ROOTS.flatMap((root) => files(join(WEB, root)))
      .filter((path) => !ALLOWED.has(relative(WEB, path)))
      .flatMap((path) =>
        readFileSync(path, "utf8")
          .split("\n")
          .map((line, index) => ({ line: line.trim(), at: `${relative(WEB, path)}:${index + 1}` }))
          .filter(({ line }) => !/^(import|export \* from|\/\/|\*|\/\*)/.test(line) && VENDORS.test(line)),
      )
      .map(({ at, line }) => `${at}  ${line}`);
    expect(leaks).toEqual([]);
  });
});
