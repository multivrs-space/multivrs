# @multivrs/builder-swift-rust

The flagship build and compilation pipeline for **`swift-rust`** applications on the [Multivrs Platform](https://multivrs.space).

Drives the `swift-rust` toolchain, parses output manifests, optimizes static assets, and maps per-route render modes (`wasm`, `ssr`, `ssr-htmx`, `ssr-wasm`) to edge serving targets.

---

## ⚡ Architecture

| Mode | What it is | Serving Target | Compute Needed? |
|---|---|---|---|
| **`wasm`** | Client-Side SPA compiled to WebAssembly | Fully static — served from R2 / CDN | **No** (0 ms latency) |
| **`ssr`** | Native Server-Rendered HTML | Edge binary execution | **Yes** (streaming HTML) |
| **`ssr-htmx`** | Progressive Hypermedia SSR | HTML-fragment endpoints on compute | **Yes** (lightweight) |
| **`ssr-wasm`** | SSR + WebAssembly Hydration | SSR on compute; `.wasm` served static | **Yes** (hybrid) |

---

## License

MIT © [Multivrs](https://multivrs.space)
