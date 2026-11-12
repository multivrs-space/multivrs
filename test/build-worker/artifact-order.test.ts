import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { artifactFromMetadata } from "../../apps/web/src/lib/artifacts/validation";
import { compareArtifactPaths } from "../../packages/build-utils/src/artifact";

const hash = (text: string) => createHash("sha256").update(text).digest("hex");

/** What the Rust CLI sends: files in byte order, hashed in that order. */
function cliManifest(paths: string[]) {
  const files = [...paths]
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
    .map((path) => ({ path, hash: hash(path), size: path.length }));
  const digest = createHash("sha256");
  for (const file of files) digest.update(`${file.path}:${file.hash}\n`);
  return { files, artifactHash: digest.digest("hex") };
}

describe("artifact manifests", () => {
  test("paths sort by bytes: digits, then capitals, then _ before lowercase", () => {
    const paths = ["favicon.ico", "_next/a.js", "404.html", "BUILD_ID"];
    expect([...paths].sort(compareArtifactPaths)).toEqual([
      "404.html",
      "BUILD_ID",
      "_next/a.js",
      "favicon.ico",
    ]);
  });

  test("the server accepts a manifest the CLI hashed, for Next and swift-rust outputs", () => {
    const manifest = cliManifest([
      "_swift-rust/navigator.js",
      "404.html",
      "BUILD_ID",
      "_next/static/a.js",
      "server.mjs",
    ]);
    const artifact = artifactFromMetadata({
      artifactHash: manifest.artifactHash,
      target: "production",
      files: manifest.files,
      output: {
        framework: "swift-rust",
        staticDir: ".",
        functions: [],
        routes: [{ src: "/(.*)", target: { type: "static" } }],
      },
    });
    expect(artifact.hash).toBe(manifest.artifactHash);
  });
});
