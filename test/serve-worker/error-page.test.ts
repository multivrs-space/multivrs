import { describe, expect, test } from "bun:test";
import { platformError } from "../../apps/serve-worker/src/error-page";
import { notFoundPage } from "../../apps/serve-worker/src/resolve";
import type { ArtifactManifest } from "../../apps/serve-worker/src/types";

const browser = (url: string) =>
  new Request(url, { headers: { accept: "text/html,application/xhtml+xml", "cf-ray": "abc123" } });

describe("platform error pages", () => {
  test("a browser gets the branded page with the code and request id", async () => {
    const response = platformError(browser("https://gone.multivrs.app/"), "DEPLOYMENT_NOT_FOUND");
    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toContain("text/html");
    expect(response.headers.get("x-multivrs-error")).toBe("DEPLOYMENT_NOT_FOUND");
    const html = await response.text();
    expect(html).toContain("Nothing is deployed here");
    expect(html).toContain("404 DEPLOYMENT_NOT_FOUND");
    expect(html).toContain("gone.multivrs.app");
    expect(html).toContain("abc123");
    expect(html).not.toMatch(/cloudflare/i);
  });

  test("everything else gets JSON with the same code", async () => {
    const response = platformError(
      new Request("https://x.multivrs.app/api"),
      "USAGE_LIMIT_REACHED",
    );
    expect(response.status).toBe(402);
    expect(await response.json()).toEqual({
      error: { code: "USAGE_LIMIT_REACHED", message: expect.any(String) },
    });
  });

  test("the address can't inject markup", async () => {
    const html = await platformError(
      browser("https://x.multivrs.app/"),
      "APP_UNAVAILABLE",
      '<script>alert("x")</script>',
    ).text();
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&#60;script&#62;");
  });

  test("an app's own 404 page is found in its static folder", () => {
    const file = (path: string) => ({ path, hash: "h", size: 1 });
    const manifest = {
      files: [file("server.mjs"), file("static/404.html")],
      output: { staticDir: "static", routes: [], functions: [] },
    } as unknown as ArtifactManifest;
    expect(notFoundPage(manifest)?.path).toBe("static/404.html");
    expect(notFoundPage({ ...manifest, files: [file("server.mjs")] })).toBeNull();
  });
});
