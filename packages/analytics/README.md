# @multivrs/analytics

The official client-side web analytics SDK for the [Multivrs Platform](https://multivrs.space) — purpose-built for **swift-rust**, Next.js, and modern full-stack web applications.

Collect lightweight, privacy-focused pageviews and custom interaction events with zero cookies and sub-millisecond edge dispatch.

---

## ⚡ Flagship Support: `swift-rust`

`@multivrs/analytics` is designed to run natively inside **`swift-rust`** web applications across both client-side WebAssembly (`wasm`) and server-side rendering (`ssr` / `ssr-htmx`):
- **WASM Client SPA**: Direct zero-dependency integration inside WebAssembly event dispatchers.
- **SSR & Progressive Web**: Auto-injected or manually triggered inside TSX client components.

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
bun add @multivrs/analytics

# npm
npm install @multivrs/analytics

# pnpm
pnpm add @multivrs/analytics
```

---

## 🏎️ Quickstart

### 1. swift-rust (TSX)

```tsx
import { track, page } from "@multivrs/analytics";

// Track pageview on route transition
page();

// Track custom user interactions
export function SignupButton() {
  return (
    <button
      onClick={() => {
        track("signup_clicked", { tier: "pro", framework: "swift-rust" });
      }}
    >
      Get Started
    </button>
  );
}
```

### 2. Configuration & Filtering

```typescript
import { configureAnalytics } from "@multivrs/analytics";

configureAnalytics({
  beforeSend: (event) => {
    // Strip sensitive parameters or ignore debug events
    if (event.name === "internal_debug") return null;
    return event;
  },
});
```

---

## License

MIT © [Multivrs](https://multivrs.space)
