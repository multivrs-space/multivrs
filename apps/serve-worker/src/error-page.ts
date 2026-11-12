/**
 * Platform error pages for *.multivrs.app: what a visitor sees when there is
 * no deployment at an address, a site is paused, or an app can't start.
 * Self-contained (no fonts or scripts to fetch), light and dark, with a code
 * and request id the site owner can quote. Non-HTML clients get JSON.
 */

export type PlatformErrorCode =
  | "NOT_FOUND"
  | "DEPLOYMENT_NOT_FOUND"
  | "DEPLOYMENT_FILES_MISSING"
  | "DEPLOYMENT_UNAVAILABLE"
  | "USAGE_LIMIT_REACHED"
  | "APP_UNAVAILABLE";

const COPY: Record<PlatformErrorCode, { status: number; title: string; message: string }> = {
  NOT_FOUND: {
    status: 404,
    title: "This page doesn't exist",
    message: "The site is live, but there's nothing at this address.",
  },
  DEPLOYMENT_NOT_FOUND: {
    status: 404,
    title: "Nothing is deployed here",
    message:
      "There's no deployment at this address. It may be mistyped, or the project or deployment was removed.",
  },
  DEPLOYMENT_FILES_MISSING: {
    status: 404,
    title: "This deployment is incomplete",
    message: "Its files aren't available. Redeploying the project will restore it.",
  },
  DEPLOYMENT_UNAVAILABLE: {
    status: 502,
    title: "This site couldn't be reached",
    message: "Something went wrong on our side while finding it. Try again in a moment.",
  },
  USAGE_LIMIT_REACHED: {
    status: 402,
    title: "This site is paused",
    message: "It has used its plan's allowance. The owner can resume it from the dashboard.",
  },
  APP_UNAVAILABLE: {
    status: 503,
    title: "This app couldn't start",
    message: "The deployment is there, but its server isn't answering. Try again in a moment.",
  },
};

const DASHBOARD_URL = "https://multivrs.space";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

function wantsHtml(request: Request): boolean {
  return (request.headers.get("accept") ?? "").includes("text/html");
}

export function platformError(
  request: Request,
  code: PlatformErrorCode,
  detail?: string,
): Response {
  const copy = COPY[code];
  const headers = { "cache-control": "no-store", "x-multivrs-error": code };
  if (!wantsHtml(request)) {
    return Response.json(
      { error: { code, message: detail ?? copy.message } },
      { status: copy.status, headers },
    );
  }
  const url = new URL(request.url);
  const requestId = request.headers.get("cf-ray") ?? crypto.randomUUID();
  const region = typeof request.cf?.colo === "string" ? request.cf.colo : "";
  return new Response(errorHtml({ ...copy, code, detail, host: url.hostname, region, requestId }), {
    status: copy.status,
    headers: { ...headers, "content-type": "text/html; charset=utf-8" },
  });
}

function errorHtml(page: {
  code: PlatformErrorCode;
  detail?: string;
  host: string;
  message: string;
  region: string;
  requestId: string;
  status: number;
  title: string;
}): string {
  const rows = [
    ["Code", `${page.status} ${page.code}`],
    ["Address", page.host],
    ["Request", page.region ? `${page.region}::${page.requestId}` : page.requestId],
  ];
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${escapeHtml(page.title)} · Multivrs</title><style>${STYLE}</style></head><body><main><span class="mark" aria-hidden="true">${MARK}</span><p class="status">${page.status}</p><h1>${escapeHtml(page.title)}</h1><p class="message">${escapeHtml(page.detail ?? page.message)}</p><dl>${rows
    .map(([label, value]) => `<div><dt>${label}</dt><dd>${escapeHtml(value ?? "")}</dd></div>`)
    .join(
      "",
    )}</dl><nav><a class="primary" href="${DASHBOARD_URL}">Open Multivrs</a><a href="${DASHBOARD_URL}/docs">Docs</a></nav></main><footer>Served by Multivrs</footer></body></html>`;
}

const MARK =
  '<svg viewBox="0 0 100 100" width="28" height="28"><path d="M14 78 L38 26 L50 52 L62 26 L86 78" fill="none" stroke="currentColor" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/></svg>';

const STYLE = `
:root{--bg:#fff;--fg:#18181b;--muted:#71717a;--line:rgba(0,0,0,.08);--well:rgba(0,0,0,.03);--primary:#9333ea;--tile:#fff;--shadow:0 1px 2px rgba(0,0,0,.06),0 12px 32px -12px rgba(0,0,0,.18)}
@media (prefers-color-scheme:dark){:root{--bg:#000;--fg:#fafafa;--muted:#a1a1aa;--line:rgba(255,255,255,.08);--well:rgba(255,255,255,.04);--primary:#a855f7;--tile:#0a0a0a;--shadow:inset 0 1px 0 rgba(255,255,255,.06),0 12px 32px -12px rgba(0,0,0,.8)}}
*{box-sizing:border-box;margin:0}
body{min-height:100dvh;display:grid;grid-template-rows:1fr auto;grid-template-columns:minmax(0,1fr);place-items:center;background:var(--bg);color:var(--fg);font:15px/1.55 ui-sans-serif,-apple-system,"Hanken Grotesk","Segoe UI",system-ui,sans-serif;padding:24px 16px}
main{width:100%;max-width:440px;text-align:center;position:relative}
main::before{content:"";position:absolute;left:50%;top:-40px;width:260px;height:260px;transform:translateX(-50%);border-radius:50%;background:color-mix(in oklab,var(--primary) 18%,transparent);filter:blur(60px);z-index:-1}
.mark{display:inline-grid;place-items:center;width:64px;height:64px;border-radius:18px;background:var(--tile);border:1px solid var(--line);box-shadow:var(--shadow);color:var(--primary)}
.status{margin-top:20px;font:500 11px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.16em;color:var(--muted)}
h1{margin-top:10px;font-size:26px;line-height:1.15;letter-spacing:-.03em;font-weight:600}
.message{margin-top:10px;color:var(--muted)}
dl{margin-top:24px;border:1px solid var(--line);border-radius:14px;background:var(--well);text-align:left;font:12px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace}
dl div{display:flex;justify-content:space-between;gap:16px;padding:10px 14px}
dl div+div{border-top:1px solid var(--line)}
dt{color:var(--muted)}
dt{flex-shrink:0}
dd{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
nav{margin-top:24px;display:flex;justify-content:center;gap:8px;flex-wrap:wrap}
nav a{display:inline-flex;align-items:center;height:38px;padding:0 16px;border-radius:999px;border:1px solid var(--line);color:var(--fg);text-decoration:none;font-weight:500;font-size:14px}
nav a.primary{background:var(--primary);border-color:transparent;color:#fff}
nav a:focus-visible{outline:2px solid var(--primary);outline-offset:2px}
footer{color:var(--muted);font-size:12px;padding-top:24px}
`;
