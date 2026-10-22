# @multivrs/speed-insights

The official Core Web Vitals and real-user monitoring (RUM) SDK for the [Multivrs Platform](https://multivrs.space) — purpose-built for **swift-rust**, Next.js, and modern full-stack web applications.

Collect and report real-time Core Web Vitals (LCP, INP, CLS, TTFB) with zero render-blocking overhead via background beacon dispatch.

---

## ⚡ Flagship Support: `swift-rust`

`@multivrs/speed-insights` provides native performance telemetry for **`swift-rust`** web applications:
- **Zero Overhead**: Uses `navigator.sendBeacon` to dispatch vitals off the main thread.
- **Route-Aware**: Tracks performance metrics per route across `wasm` client SPAs and `ssr` edge pages.

---

## 📦 Compatible Frameworks

1. **`swift-rust`** 🦀 (Flagship — WASM SPAs, SSR, and htmx)
2. **Next.js** (App Router & Pages Router)
3. **Vite** (React, Vue, Svelte, Solid)
4. **Remix & Astro**
5. **Static HTML/JS**

---

## 📥 Installation

```bash
# bun
bun add @multivrs/speed-insights

# npm
npm install @multivrs/speed-insights
```

---

## 🏎️ Quickstart

```typescript
import { reportWebVital } from "@multivrs/speed-insights";

// Report an observed Core Web Vital metric
reportWebVital({
  name: "LCP",
  value: 850,
  path: window.location.pathname,
  route: "/dashboard",
});
```

---

## License

MIT © [Multivrs](https://multivrs.space)
