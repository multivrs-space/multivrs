import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, ".vercel", "output");
const STATIC_DIR = join(OUT_DIR, "static");
const FUNC_DIR = join(OUT_DIR, "functions", "pay", "[id].func");
const PAY_DIR = join(ROOT, "src", "app", "pay", "[id]");

function loadProductionEnvDefines() {
  const defines = { "process.env.NODE_ENV": '"production"' };
  const envFile = join(ROOT, ".env.production");
  if (existsSync(envFile)) {
    for (const rawLine of readFileSync(envFile, "utf8").split("\n")) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq <= 0) continue;
      const key = line.slice(0, eq).trim();
      const fileVal = line
        .slice(eq + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      const val = process.env[key] ?? fileVal;
      defines[`process.env.${key}`] = JSON.stringify(val);
    }
  }
  return defines;
}

const ENV_DEFINES = loadProductionEnvDefines();

async function buildPayClientIsland() {
  const islandDir = join(STATIC_DIR, "_swift-rust", "island");
  mkdirSync(islandDir, { recursive: true });

  const checkoutFile = join(PAY_DIR, "checkout-form.tsx");
  const hostedFile = join(PAY_DIR, "hosted-checkout.tsx");
  const tmpEntry = join(PAY_DIR, `.__sr_pay_island_${process.pid}.tsx`);

  const entryCode = [
    `import { createElement } from "react";`,
    `import { createRoot, hydrateRoot } from "react-dom/client";`,
    `import { CheckoutForm } from ${JSON.stringify(checkoutFile)};`,
    `import { HostedCheckout } from ${JSON.stringify(hostedFile)};`,
    `const COMPONENTS: Record<string, any> = { CheckoutForm, HostedCheckout };`,
    `const nodes = document.querySelectorAll("[data-sr-island]");`,
    `for (let i = 0; i < nodes.length; i++) {`,
    `  const el = nodes[i] as HTMLElement & { __srHydrated?: boolean };`,
    `  const name = el.getAttribute("data-sr-island-export") || "";`,
    `  const Comp = COMPONENTS[name];`,
    `  if (!Comp || el.__srHydrated) continue;`,
    `  el.__srHydrated = true;`,
    `  let props = {};`,
    `  try { props = JSON.parse(el.getAttribute("data-sr-island-props") || "{}"); } catch {}`,
    `  const element = createElement(Comp, props);`,
    `  try { hydrateRoot(el, element); } catch { el.innerHTML = ""; createRoot(el).render(element); }`,
    `}`,
  ].join("\n");

  writeFileSync(tmpEntry, entryCode);
  try {
    const res = await Bun.build({
      entrypoints: [tmpEntry],
      target: "browser",
      minify: true,
      define: ENV_DEFINES,
    });
    if (!res.success) {
      throw new AggregateError(res.logs, "Failed to bundle pay client island");
    }
    const code = await res.outputs[0].text();
    const outFile = join(islandDir, "pay-checkout.js");
    writeFileSync(outFile, code);
    return "/_swift-rust/island/pay-checkout.js";
  } finally {
    try {
      unlinkSync(tmpEntry);
    } catch {}
  }
}

async function buildPayFunction(islandUrl) {
  mkdirSync(FUNC_DIR, { recursive: true });

  const indexHtmlPath = join(STATIC_DIR, "index.html");
  let head = "";
  if (existsSync(indexHtmlPath)) {
    const html = readFileSync(indexHtmlPath, "utf8");
    head = (html.match(/<head>([\s\S]*?)<\/head>/i) || ["", ""])[1];
  }

  const fnCore = join(
    ROOT,
    "node_modules",
    "swift-rust",
    "bin",
    "runtime",
    "fn-core.mjs",
  );
  const pageFile = join(PAY_DIR, "page.tsx");
  const layoutFile = join(ROOT, "src", "app", "layout.tsx");
  const seoFile = join(ROOT, "src", "app", "seo.tsx");
  const checkoutFile = join(PAY_DIR, "checkout-form.tsx");
  const hostedFile = join(PAY_DIR, "hosted-checkout.tsx");

  const rawCheckoutTmp = join(PAY_DIR, `.__sr_raw_checkout_${process.pid}.tsx`);
  const rawHostedTmp = join(PAY_DIR, `.__sr_raw_hosted_${process.pid}.tsx`);
  const tmpEntry = join(PAY_DIR, `.__sr_pay_fn_${process.pid}.ts`);

  writeFileSync(rawCheckoutTmp, readFileSync(checkoutFile, "utf8"));
  writeFileSync(rawHostedTmp, readFileSync(hostedFile, "utf8"));

  const islandPlugin = {
    name: "pay-island-wrapper",
    setup(build) {
      build.onResolve(
        { filter: /^\.\/(checkout-form|hosted-checkout)$/ },
        (args) => {
          if (args.importer !== pageFile) return undefined;
          const isCheckout = args.path.endsWith("checkout-form");
          return {
            path: isCheckout ? checkoutFile : hostedFile,
            namespace: "pay-island",
          };
        },
      );
      build.onLoad({ filter: /.*/, namespace: "pay-island" }, (args) => {
        const isCheckout = args.path === checkoutFile;
        const exportName = isCheckout ? "CheckoutForm" : "HostedCheckout";
        const rawTarget = isCheckout ? rawCheckoutTmp : rawHostedTmp;
        return {
          loader: "tsx",
          resolveDir: PAY_DIR,
          contents: [
            `import { createElement as __h } from "react";`,
            `import { ${exportName} as __Comp } from ${JSON.stringify(rawTarget)};`,
            `function __ser(props: Record<string, unknown>) {`,
            `  const out: Record<string, unknown> = {};`,
            `  for (const k of Object.keys(props)) {`,
            `    if (k === "children") continue;`,
            `    out[k] = props[k];`,
            `  }`,
            `  return JSON.stringify(out).replace(/</g, "\\\\u003c");`,
            `}`,
            `export function ${exportName}(props: any) {`,
            `  return __h("div", {`,
            `    "data-sr-island": "",`,
            `    "data-sr-island-export": ${JSON.stringify(exportName)},`,
            `    "data-sr-island-props": __ser(props),`,
            `    style: { display: "contents" },`,
            `  }, __h(__Comp, props));`,
            `}`,
          ].join("\n"),
        };
      });
    },
  };

  const entryCode = [
    `import { Readable } from "node:stream";`,
    `import { makeRouteHandler } from ${JSON.stringify(fnCore)};`,
    `import * as pageMod from ${JSON.stringify(pageFile)};`,
    `import * as layoutMod from ${JSON.stringify(layoutFile)};`,
    `import * as seoMod from ${JSON.stringify(seoFile)};`,
    ``,
    `const baseHandler = makeRouteHandler({`,
    `  page: pageMod,`,
    `  layouts: [layoutMod],`,
    `  layoutMetas: [layoutMod],`,
    `  slots: [[]],`,
    `  proxies: [],`,
    `  schemas: [],`,
    `  guards: [],`,
    `  guardEnabled: false,`,
    `  action: undefined,`,
    `  loaders: [],`,
    `  query: undefined,`,
    `  state: undefined,`,
    `  seo: seoMod,`,
    `  i18n: undefined,`,
    `  revalidate: undefined,`,
    `  isClient: false,`,
    `  islandSrc: "",`,
    `  bodyScripts: ${JSON.stringify(`<script type="module" src="${islandUrl}"></script>`)},`,
    `  pattern: ["pay", "[id]"],`,
    `  runtime: "node",`,
    `  head: ${JSON.stringify(head)},`,
    `});`,
    ``,
    `function normalizePayUrl(rawUrl: string, headers: Headers): string {`,
    `  const url = new URL(rawUrl, "https://vrs-pay.multivrs.space");`,
    `  const decodedPath = decodeURIComponent(url.pathname);`,
    `  if (decodedPath === "/pay/[id]" || decodedPath.endsWith("/[id]")) {`,
    `    let id = url.searchParams.get("__sr_id") || url.searchParams.get("id") || "";`,
    `    if (!id) {`,
    `      const routeMatches = headers.get("x-now-route-matches");`,
    `      if (routeMatches) {`,
    `        const parsed = new URLSearchParams(routeMatches);`,
    `        id = parsed.get("1") || parsed.get("id") || "";`,
    `      }`,
    `    }`,
    `    if (!id) {`,
    `      const matchedPath = headers.get("x-matched-path") || headers.get("x-invoke-path") || "";`,
    `      const m = matchedPath.match(/^\\/pay\\/([^/?#]+)/);`,
    `      if (m && m[1] !== "[id]" && m[1] !== "%5Bid%5D") id = decodeURIComponent(m[1]);`,
    `    }`,
    `    if (id) {`,
    `      url.pathname = "/pay/" + encodeURIComponent(id);`,
    `    }`,
    `  }`,
    `  url.searchParams.delete("__sr_id");`,
    `  return url.toString();`,
    `}`,
    ``,
    `async function handleWebRequest(request: Request): Promise<Response> {`,
    `  const normalizedUrl = normalizePayUrl(request.url, request.headers);`,
    `  const req = normalizedUrl === request.url ? request : new Request(normalizedUrl, request);`,
    `  return baseHandler(req);`,
    `}`,
    ``,
    `async function universalHandler(reqOrRequest: any, res?: any): Promise<any> {`,
    `  if (!res || typeof res.end !== "function") {`,
    `    return handleWebRequest(reqOrRequest as Request);`,
    `  }`,
    `  const req = reqOrRequest;`,
    `  const proto = req.headers?.["x-forwarded-proto"] || "https";`,
    `  const host = req.headers?.["x-forwarded-host"] || req.headers?.host || "vrs-pay.multivrs.space";`,
    `  const headers = new Headers();`,
    `  for (const [key, value] of Object.entries(req.headers || {})) {`,
    `    if (Array.isArray(value)) {`,
    `      for (const v of value) if (v !== undefined) headers.append(key, String(v));`,
    `    } else if (value !== undefined) {`,
    `      headers.set(key, String(value));`,
    `    }`,
    `  }`,
    `  const method = req.method || "GET";`,
    `  const fullUrl = normalizePayUrl(\`\${proto}://\${host}\${req.url || "/"}\`, headers);`,
    `  const init: RequestInit & { duplex?: string } = { method, headers };`,
    `  if (method !== "GET" && method !== "HEAD") {`,
    `    init.body = Readable.toWeb(req) as unknown as ReadableStream;`,
    `    init.duplex = "half";`,
    `  }`,
    `  const webReq = new Request(fullUrl, init);`,
    `  const webRes = await baseHandler(webReq);`,
    `  res.statusCode = webRes.status;`,
    `  webRes.headers.forEach((value, key) => {`,
    `    res.setHeader(key, value);`,
    `  });`,
    `  const buf = Buffer.from(await webRes.arrayBuffer());`,
    `  res.end(buf);`,
    `}`,
    ``,
    `universalHandler.default = universalHandler;`,
    `universalHandler.fetch = handleWebRequest;`,
    `universalHandler.GET = handleWebRequest;`,
    `universalHandler.HEAD = handleWebRequest;`,
    `universalHandler.POST = handleWebRequest;`,
    `module.exports = universalHandler;`,
  ].join("\n");

  writeFileSync(tmpEntry, entryCode);
  try {
    const res = await Bun.build({
      entrypoints: [tmpEntry],
      target: "node",
      format: "cjs",
      minify: true,
      define: ENV_DEFINES,
      plugins: [islandPlugin],
    });
    if (!res.success) {
      throw new AggregateError(res.logs, "Failed to bundle pay/[id] function");
    }
    const code = await res.outputs[0].text();
    writeFileSync(join(FUNC_DIR, "index.js"), code);
    writeFileSync(
      join(FUNC_DIR, "package.json"),
      `${JSON.stringify({ type: "commonjs" }, null, 2)}\n`,
    );
    writeFileSync(
      join(FUNC_DIR, ".vc-config.json"),
      `${JSON.stringify(
        {
          runtime: "nodejs24.x",
          handler: "index.js",
          launcherType: "Nodejs",
          supportsResponseStreaming: true,
        },
        null,
        2,
      )}\n`,
    );
  } finally {
    for (const f of [tmpEntry, rawCheckoutTmp, rawHostedTmp]) {
      try {
        unlinkSync(f);
      } catch {}
    }
  }
}

function updateVercelOutputConfig() {
  const configPath = join(OUT_DIR, "config.json");
  if (!existsSync(configPath)) return;
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  if (Array.isArray(config.routes)) {
    for (const route of config.routes) {
      if (
        route &&
        route.src === "^/pay/([^/]+)/?$" &&
        route.dest === "/pay/[id]"
      ) {
        route.dest = "/pay/[id]?__sr_id=$1";
      }
    }
  }
  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
}

const islandUrl = await buildPayClientIsland();
await buildPayFunction(islandUrl);
updateVercelOutputConfig();
process.stdout.write(
  "  ✓ patched /pay/[id] Vercel function and client island\n",
);
