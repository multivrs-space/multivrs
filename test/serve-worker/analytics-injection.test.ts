import { describe, expect, test } from "bun:test";
import { BROWSER_ANALYTICS_SCRIPT } from "../../apps/serve-worker/src/browser-analytics";
import { instrumentHtml } from "../../apps/serve-worker/src/insights";

const deployment = { analyticsEnabled: true, speedInsightsEnabled: true };
const html = (body: string) =>
  new Response(body, { headers: { "content-type": "text/html; charset=utf-8" } });

describe("analytics injection", () => {
  test("a page with a head per layout still gets one script", async () => {
    const page =
      "<html><head><title>a</title></head><body><html><head></head><body>x</body></html></body></html>";
    const out = await instrumentHtml(html(page), deployment).text();
    expect(out.match(/\/_multivrs\/analytics\.js/g)?.length).toBe(1);
  });

  test("a re-run of the script (client-side navigation) does nothing", () => {
    let beacons = 0;
    const fakeWindow = { __multivrsAnalytics: { page() {}, track() {} } };
    // With the global already set, the script must return before touching
    // the DOM, storage or the network.
    const run = new Function(
      "window",
      "document",
      "navigator",
      `${BROWSER_ANALYTICS_SCRIPT}; return true;`,
    );
    expect(
      run(fakeWindow, undefined, {
        sendBeacon() {
          beacons += 1;
        },
      }),
    ).toBe(true);
    expect(beacons).toBe(0);
  });
});
