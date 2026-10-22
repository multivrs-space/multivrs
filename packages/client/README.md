# @multivrs/client

The official typed TypeScript client SDK for the [Multivrs Platform](https://multivrs.space) Control-Plane API — purpose-built for **swift-rust**, Next.js, Bun, and serverless environments.

Programmatically manage projects, deployments, build artifacts, real-time deployment logs, and domains.

---

## ⚡ Flagship Support: `swift-rust`

`@multivrs/client` powers programmatic deployments and orchestration for **`swift-rust`** toolchains, custom CI/CD pipelines, and edge compute services:
- **Zero Node-Only Dependencies**: Pure web standard `fetch` execution — runs in Bun, Deno, Cloudflare Workers, Node.js, and WASM runtimes.
- **Strict Validation**: Fully typed with Zod schema contracts for all API inputs and responses.

---

## 📦 Supported Runtimes

1. **`swift-rust`** 🦀 (Flagship — Server routes, background workers, automation)
2. **Bun** (Edge runtime & CLI toolchains)
3. **Cloudflare Workers & V8 Isolates**
4. **Node.js** (v18+)

---

## 📥 Installation

```bash
# bun
bun add @multivrs/client

# npm
npm install @multivrs/client
```

---

## 🏎️ Quickstart

```typescript
import { createClient } from "@multivrs/client";

const client = createClient({
  baseUrl: "https://multivrs.space",
  token: process.env.MULTIVRS_API_TOKEN,
});

// 1. List active projects
const projects = await client.listProjects();

// 2. Trigger a deployment
const deployment = await client.createDeployment("proj_12345", {
  ref: "main",
});

console.log("Deployment created:", deployment.id);
```

---

## License

MIT © [Multivrs](https://multivrs.space)
