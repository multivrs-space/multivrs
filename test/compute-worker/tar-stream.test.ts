import { describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { type TarEntry, tarStream, ustarPath } from "../../apps/compute-worker/src/tar-stream";

const bytes = (text: string) => new TextEncoder().encode(text);
const entry = (path: string, content: string): TarEntry => {
  const data = bytes(content);
  return {
    path,
    size: data.byteLength,
    body: new Response(data).body as ReadableStream<Uint8Array>,
  };
};

async function* entries(list: TarEntry[]) {
  for (const item of list) yield item;
}

describe("runtime archive", () => {
  test("fits long paths into ustar's prefix and name", () => {
    expect(ustarPath("server.mjs")).toEqual({ name: "server.mjs", prefix: "" });
    const long = `${"a".repeat(80)}/${"b".repeat(60)}/file.js`;
    expect(ustarPath(long)).toEqual({
      name: "file.js",
      prefix: `${"a".repeat(80)}/${"b".repeat(60)}`,
    });
    expect(ustarPath("c".repeat(120))).toBeNull();
  });

  test("unpacks with the system tar exactly as written", async () => {
    const long = `static/${"deep/".repeat(22)}island.js`;
    const archive = tarStream(
      entries([
        entry("server.mjs", "console.log('hi')\n"),
        entry("static/empty.txt", ""),
        entry(long, "x".repeat(1_234)),
        entry("static/_swift-rust/island/a.js", "y".repeat(512)),
      ]),
    );
    const data = new Uint8Array(await new Response(archive).arrayBuffer());
    expect(data.byteLength % 512).toBe(0);
    const dir = mkdtempSync(join(tmpdir(), "multivrs-tar-"));
    const unpack = Bun.spawnSync(["tar", "-x", "-C", dir], { stdin: data });
    expect(unpack.exitCode).toBe(0);
    expect(readFileSync(join(dir, "server.mjs"), "utf8")).toBe("console.log('hi')\n");
    expect(readFileSync(join(dir, "static/empty.txt"), "utf8")).toBe("");
    expect(readFileSync(join(dir, long), "utf8")).toBe("x".repeat(1_234));
    expect(readFileSync(join(dir, "static/_swift-rust/island/a.js"), "utf8")).toBe("y".repeat(512));
  });
});
