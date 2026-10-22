# @multivrs/cli

The official native Command-Line Interface for the [Multivrs Platform](https://multivrs.space) — engineered in 100% pure Rust for sub-millisecond startup, zero Node.js runtime overhead, and blazing-fast deployments.

Purpose-built from the ground up for **swift-rust**, the next-generation native web framework, with zero-config support for Next.js, Vite, Astro, Remix, and modern full-stack web applications.

---

## ⚡ Flagship Framework: `swift-rust`

Multivrs is the native home for **`swift-rust`** applications. The CLI provides first-class, zero-configuration detection, local compilation toolchains, multi-threaded asset optimization, and instant edge deployments for `swift-rust`.

### Native Multi-Render Targets

`swift-rust` projects compile TSX with a high-performance Rust + Bun engine, targeting four deployment modes out of the box:

| Render Mode | Architecture | Delivery & Execution | Compute Latency |
|---|---|---|---|
| **`wasm`** | Client-Side SPA compiled to WebAssembly | Fully static, cached globally across edge CDN and Cloudflare R2 | **0 ms** (Edge Static) |
| **`ssr`** | Native Server-Side Rendering (Rust HTML) | Compiled single-binary execution on high-speed edge compute | **< 5 ms** (Streaming SSR) |
| **`ssr-htmx`** | Progressive Hypermedia SSR | Server-rendered HTML with lightweight htmx fragment streaming | **< 5 ms** (Hypermedia) |
| **`ssr-wasm`** | Hydrated SSR + WebAssembly | Server-rendered HTML shell + client-side `.wasm` hydration bundle | **Hybrid** (SSR + Instant Hydration) |

### 🚀 Built-in Asset Optimization Pipeline

Every `swift-rust` deploy invokes our native Rust + Rayon parallel asset optimizer before uploading:
- **Perceptually Lossless Image Compression**: WebP and AVIF generation at build-time (shrinking typical 3 MB images down to ~230 KB with zero visible quality loss).
- **Automated Font Subsetting & WOFF2**: Strips unused glyphs and precompresses font assets.
- **Brotli Precompression**: Text, CSS, JS, and HTML are precompressed at maximum compression levels.
- **Immutable Content-Addressed Storage**: Assets are hashed using BLAKE3/SHA-256 and uploaded directly to Cloudflare R2.

---

## 📦 Supported Frameworks

`multivrs deploy` inspects your project root and automatically selects the optimal edge builder. **`swift-rust` is detected and prioritized as our premier first-class framework**:

1. **`swift-rust`** 🦀 (Flagship — Native Rust + TSX, WASM, Edge SSR, htmx)
2. **Next.js** (App Router & Pages Router via OpenNext)
3. **Vite** (React, Vue, Svelte, Solid)
4. **Remix**
5. **Astro**
6. **Nuxt**
7. **Hono & Edge Runtimes**
8. **Static HTML/CSS/JS**

---

## 📥 Installation

The CLI is distributed as a precompiled native binary with zero external runtime requirements.

### Global Installation

```bash
# npm
npm install -g @multivrs/cli

# bun
bun add -g @multivrs/cli

# pnpm
pnpm add -g @multivrs/cli

# yarn
yarn global add @multivrs/cli
```

### On-Demand Execution (No Installation Required)

```bash
# Preview deployment
npx @multivrs/cli deploy

# Production deployment
npx @multivrs/cli deploy --prod
```

---

## 🏎️ Quickstart: Deploying swift-rust

1. **Log in to Multivrs**:
   ```bash
   multivrs login --token <your-developer-token>
   ```
   *(Generate developer tokens in your Multivrs Dashboard under **Account Settings → Developer Tokens**)*

2. **Link your project**:
   ```bash
   multivrs link --project <project-id>
   ```

3. **Deploy**:
   ```bash
   # Deploy a preview build
   multivrs deploy

   # Deploy directly to production (instant atomic alias flip)
   multivrs deploy --prod
   ```

---

## 🛠️ CLI Commands

### `multivrs deploy`
Builds, optimizes assets, and uploads your project snapshot to Multivrs:
```bash
# Deploy preview
multivrs deploy

# Deploy and promote straight to production
multivrs deploy --prod
```

### `multivrs login`
Authenticate your machine using a Multivrs Developer Token:
```bash
multivrs login --token <token>
```

### `multivrs whoami`
Verify your active developer credentials and masked token:
```bash
multivrs whoami
```

### `multivrs link`
Bind the current workspace directory to a Multivrs project:
```bash
multivrs link --project <project-id> [--org <org-id>]
```

### `multivrs logout`
Safely purge stored credentials from `~/.multivrs/credentials.json`:
```bash
multivrs logout
```

---

## ⚡ Pure Native Architecture

Unlike traditional deployment CLIs wrapped in heavy JavaScript runtimes:
- **Zero Runtime Dependencies**: Written entirely in pure Rust. Runs without Node.js, Python, or external interpreters.
- **Microsecond Cold Starts**: Launches in under 10 milliseconds.
- **Parallel Uploads**: Rayon-driven concurrent artifact hashing and streaming uploads.
- **Deterministic**: Immutable content addressing ensures 100% reproducible deployments.

---

## 🌐 Documentation & Community

- **Platform**: [multivrs.space](https://multivrs.space)
- **Documentation**: [multivrs.space/docs](https://multivrs.space/docs)
- **Framework Guide**: [multivrs.space/docs/swift-rust](https://multivrs.space/docs/swift-rust)
- **GitHub**: [multivrs-space/multivrs](https://github.com/multivrs-space/multivrs)

---

## License

MIT © [Multivrs](https://multivrs.space)
