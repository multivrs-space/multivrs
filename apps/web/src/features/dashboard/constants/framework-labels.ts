import type { FrameworkId } from "@multivrs/config";

export const FRAMEWORK_LABELS: Record<FrameworkId, string> = {
  go: "Go",
  h3: "h3",
  hono: "Hono",
  nextjs: "Next.js",
  node: "Node.js / Bun",
  python: "Python",
  remix: "Remix",
  ruby: "Ruby",
  static: "Static site",
  "swift-rust": "Swift-Rust",
  vite: "Vite",
};
