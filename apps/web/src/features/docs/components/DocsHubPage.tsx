"use client";

import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Box,
  Check,
  Code2,
  Copy,
  Cpu,
  CreditCard,
  Database,
  ExternalLink,
  FileKey,
  Flame,
  Gauge,
  GitFork,
  Globe,
  Globe2,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  Mail,
  Package,
  Rocket,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Workflow,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AcidSquaresBackground } from "@/components/marketing/AcidSquaresBackground";
import SpecularButton from "@/components/SpecularButton";
import type { DocCategory } from "../types";

const CLI_SNIPPETS = {
  "swift-rust": {
    install: "npm install -g @multivrs/cli",
    deploy: "multivrs deploy --prod",
    tag: "Flagship",
  },
  nextjs: {
    install: "npm install -g @multivrs/cli",
    deploy: "multivrs deploy --prod",
    tag: "App Router / Pages",
  },
  vite: {
    install: "npm install -g @multivrs/cli",
    deploy: "multivrs deploy --prod",
    tag: "React / Vue / Svelte",
  },
  bun: {
    install: "bun add -g @multivrs/cli",
    deploy: "multivrs deploy --prod",
    tag: "Edge Worker",
  },
};

const FRAMEWORK_QUICKSTARTS = [
  { name: "swift-rust", label: "swift-rust 🦀", href: "/docs/swift-rust", flag: true },
  { name: "next", label: "Next.js", href: "/docs/frameworks/nextjs" },
  { name: "vite", label: "Vite", href: "/docs/frameworks/vite" },
  { name: "bun", label: "Bun", href: "/docs/quickstart" },
  { name: "remix", label: "Remix", href: "/docs/frameworks/remix-astro" },
  { name: "astro", label: "Astro", href: "/docs/frameworks/remix-astro" },
  { name: "hono", label: "Hono", href: "/docs/services/serverless-compute" },
  { name: "static", label: "Static HTML", href: "/docs/frameworks/static" },
];

interface DocsHubPageProps {
  categories?: DocCategory[];
}

export function DocsHubPage({ categories = [] }: DocsHubPageProps) {
  const [activeTab, setActiveTab] = useState<keyof typeof CLI_SNIPPETS>("swift-rust");
  const [copied, setCopied] = useState(false);

  const snippet = CLI_SNIPPETS[activeTab];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Products & Services mapped from live categories
  const shipScale = categories.find((c) => c.slug === "ship-scale")?.items ?? [];
  const runCompute = categories.find((c) => c.slug === "run-compute")?.items ?? [];
  const storageMedia = categories.find((c) => c.slug === "storage-media")?.items ?? [];
  const secureGovern = categories.find((c) => c.slug === "secure-govern")?.items ?? [];
  const observeMonetize =
    categories.find((c) => c.slug === "observability" || c.slug === "observe-monetize")?.items ?? [];
  const mailItems = categories.find((c) => c.slug === "mail")?.items ?? [];

  const products = [
    ...shipScale.filter((i) => ["cli", "client-sdk", "domains-dns"].includes(i.id)),
    ...mailItems.filter((i) => ["mail-introduction", "mail-mailboxes", "mail-broadcasts"].includes(i.id)),
    ...secureGovern.filter((i) => i.id === "auth"),
    ...observeMonetize,
  ];

  const services = [
    ...runCompute,
    ...storageMedia,
    ...shipScale.filter((i) => ["cdn-delivery"].includes(i.id)),
    ...secureGovern.filter((i) => i.id === "firewall-waf"),
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      {/* 1. Acid Squares Background Canvas (Interactive grid reacting to mouse) */}
      <AcidSquaresBackground className="opacity-60" cellSize={56} hoverRadius={180} />

      {/* 2. Top Ambient Purple Spotlight Gradient */}
      <div
        className="pointer-events-none absolute -top-28 inset-x-0 h-[450px] w-full"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 10%, rgba(168, 85, 247, 0.22) 0%, rgba(255, 255, 255, 0.04) 40%, transparent 80%)",
          filter: "blur(45px)",
        }}
        aria-hidden="true"
      />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl px-6 sm:px-10 lg:px-12 py-10 lg:py-12 flex flex-col gap-14 mx-auto">
        {/* HERO SECTION */}
        <div className="flex flex-col items-start gap-5">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-medium text-purple-300 backdrop-blur-md">
            <Sparkles className="size-3.5 text-purple-400" />
            <span>Multivrs Edge Platform · Developer Documentation</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
            Build, optimize, and deploy at the speed of Rust.
          </h1>

          <p className="max-w-3xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            Welcome to the official developer hub for the Multivrs Platform. Purpose-built from the ground up for{" "}
            <span className="text-purple-300 font-semibold">swift-rust 🦀</span>, Next.js, and high-performance serverless edge computing.
          </p>

          {/* Clerk / Cloudflare style Agent Prompt Bar */}
          <div className="w-full max-w-xl flex items-center justify-between p-2.5 rounded-xl bg-muted/70 border border-border backdrop-blur-md shadow-inner text-xs font-mono">
            <div className="flex items-center gap-2 text-foreground truncate">
              <span className="flex size-5 rounded-md bg-purple-500/20 text-purple-400 items-center justify-center text-[10px]">🤖</span>
              <span className="text-muted-foreground">Agent setup:</span>
              <span className="text-purple-300 truncate">multivrs deploy --prod</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy("multivrs deploy --prod")}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
              title="Copy prompt"
            >
              {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
            </button>
          </div>

          {/* Marketing SpecularButton Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/docs/swift-rust">
              <SpecularButton
                size="sm"
                radius={9999}
                tint="#ffffff"
                tintOpacity={0.95}
                baseColor="#ffffff"
                lineColor="#ffffff"
                textColor="#000000"
                forceTheme="dark"
              >
                <span className="flex items-center gap-1.5 font-semibold text-xs">
                  <span>Explore swift-rust 🦀</span>
                  <ArrowRight className="size-3.5" />
                </span>
              </SpecularButton>
            </Link>

            <Link href="/docs/quickstart">
              <SpecularButton
                size="sm"
                radius={9999}
                tint="#ffffff"
                tintOpacity={0.06}
                baseColor="#1c1c1c"
                lineColor="#ffffff"
                textColor="#ffffff"
                forceTheme="dark"
              >
                <span className="flex items-center gap-1.5 font-medium text-xs">
                  <Rocket className="size-3.5 text-purple-400" />
                  <span>60-Second Quickstart</span>
                </span>
              </SpecularButton>
            </Link>

            <Link href="/docs/products/cli">
              <SpecularButton
                size="sm"
                radius={9999}
                tint="#ffffff"
                tintOpacity={0.06}
                baseColor="#1c1c1c"
                lineColor="#ffffff"
                textColor="#ffffff"
                forceTheme="dark"
              >
                <span className="flex items-center gap-1.5 font-medium text-xs">
                  <Terminal className="size-3.5 text-muted-foreground" />
                  <span>CLI Reference</span>
                </span>
              </SpecularButton>
            </Link>
          </div>
        </div>

        {/* INTERACTIVE TERMINAL COMPONENT (Vercel & Cloudflare style) */}
        <div className="w-full rounded-xl border border-border/90 bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Terminal Tabs Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5 bg-muted">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-muted-foreground/40" />
                <span className="size-2.5 rounded-full bg-muted-foreground/40" />
                <span className="size-2.5 rounded-full bg-muted-foreground/40" />
              </div>
              <span className="text-[11px] font-mono text-muted-foreground ml-2">terminal</span>
            </div>

            {/* Framework Switcher Pills */}
            <div className="flex items-center gap-1 bg-card p-0.5 rounded-lg border border-border">
              {(Object.keys(CLI_SNIPPETS) as Array<keyof typeof CLI_SNIPPETS>).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    activeTab === key
                      ? "bg-purple-500/20 text-purple-200 border border-purple-500/40"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {key === "swift-rust" ? "🦀 swift-rust" : key}
                </button>
              ))}
            </div>
          </div>

          {/* Terminal Code Body */}
          <div className="p-4 sm:p-5 flex items-center justify-between font-mono text-xs text-foreground">
            <div className="flex flex-col gap-1.5">
              <div className="text-muted-foreground"># 1. Install native CLI</div>
              <div className="text-purple-300">$ {snippet.install}</div>
              <div className="text-muted-foreground mt-2"># 2. Deploy to global edge (atomic instant rollback)</div>
              <div className="text-emerald-400">$ {snippet.deploy}</div>
            </div>

            <button
              type="button"
              onClick={() => handleCopy(`${snippet.install}\n${snippet.deploy}`)}
              className="p-2 rounded-lg bg-muted hover:bg-muted border border-border text-foreground hover:text-foreground transition-colors self-start"
              title="Copy commands"
            >
              {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
            </button>
          </div>
        </div>

        {/* 4 CLERK-STYLE BENTO SPOTLIGHT CARDS */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Explore Core Primitives</h2>
            <span className="text-xs text-muted-foreground font-mono">Architecture v2</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: swift-rust Flagship */}
            <Link
              href="/docs/swift-rust"
              className="group relative rounded-xl border border-purple-500/30 bg-muted/40 hover:bg-muted/70 p-6 backdrop-blur-md transition-all duration-300 hover:border-purple-500/60 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-purple-500/10"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 text-lg">
                    🦀
                  </div>
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-purple-300 transition-colors">
                  swift-rust Framework
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  TSX compiled with a high-performance Rust + Bun engine. Four render modes: static WASM, streaming SSR, htmx, and client hydration.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-purple-400 group-hover:translate-x-0.5 transition-transform">
                <span>Read framework guide</span>
                <ArrowRight className="size-3" />
              </div>
            </Link>

            {/* Card 2: multivrs CLI */}
            <Link
              href="/docs/products/cli"
              className="group relative rounded-xl border border-border bg-muted/40 hover:bg-muted/70 p-6 backdrop-blur-md transition-all duration-300 hover:border-border flex flex-col justify-between overflow-hidden shadow-md"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted border border-border text-foreground">
                    <Terminal className="size-5" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-foreground transition-colors">
                  multivrs CLI
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Single native binary for macOS, Linux, and Windows. Microsecond cold-starts, parallel Rayon asset hashing, and instant alias promotion.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-foreground group-hover:translate-x-0.5 transition-transform">
                <span>View CLI commands</span>
                <ArrowRight className="size-3" />
              </div>
            </Link>

            {/* Card 3: Edge Services */}
            <Link
              href="/docs/services/anycast-cdn"
              className="group relative rounded-xl border border-border bg-muted/40 hover:bg-muted/70 p-6 backdrop-blur-md transition-all duration-300 hover:border-border flex flex-col justify-between overflow-hidden shadow-md"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted border border-border text-foreground">
                    <ShieldAlert className="size-5" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-foreground transition-colors">
                  Global Edge Services
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Anycast CDN, WASM regex routing, isolated serverless compute, micro-sandboxes, WAF firewall, and durable scheduler workflows.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-foreground group-hover:translate-x-0.5 transition-transform">
                <span>Explore all services</span>
                <ArrowRight className="size-3" />
              </div>
            </Link>

            {/* Card 4: Multivrs Mail */}
            <Link
              href="/docs/mail"
              className="group relative rounded-xl border border-border bg-muted/40 hover:bg-muted/70 p-6 backdrop-blur-md transition-all duration-300 hover:border-border flex flex-col justify-between overflow-hidden shadow-md"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted border border-border text-foreground">
                    <Mail className="size-5" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-foreground transition-colors">
                  Multivrs Mail
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Transactional sending via @multivrs/mail SDK & SMTP, mass marketing broadcasts & audiences, and custom domain business mailboxes.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-foreground group-hover:translate-x-0.5 transition-transform">
                <span>Explore Mail platform</span>
                <ArrowRight className="size-3" />
              </div>
            </Link>
          </div>
        </div>

        {/* PRODUCTS SECTION (9 items) */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">Products</h2>
              <p className="text-xs text-muted-foreground">Developer tools, web console, and embeddable software kits.</p>
            </div>
            <span className="text-xs text-purple-400 font-mono font-medium">{products.length} products</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {products.map((p) => (
              <Link
                key={p.id}
                href={p.href}
                className="group flex flex-col justify-between p-4 rounded-xl border border-border bg-card/60 hover:bg-muted/70 hover:border-border transition-all duration-200"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-foreground group-hover:text-purple-300 transition-colors">
                      {p.title}
                    </span>
                    {p.badge === "Coming soon" && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-muted text-foreground border border-border/60">
                        Coming soon
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{p.summary}</p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-muted-foreground group-hover:text-purple-400 transition-colors">
                  <span>Learn more</span>
                  <ArrowRight className="size-2.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* SERVICES SECTION */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">Edge Services</h2>
              <p className="text-xs text-muted-foreground">Underlying distributed infrastructure, networking, and security primitives.</p>
            </div>
            <span className="text-xs text-purple-400 font-mono font-medium">{services.length} services</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {services.map((s) => (
              <Link
                key={s.id}
                href={s.href}
                className="group flex items-start gap-3.5 p-4 rounded-xl border border-border bg-card/60 hover:bg-muted/70 hover:border-border transition-all duration-200"
              >
                <div className="size-8 rounded-lg bg-muted border border-border flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                  <Sparkles className="size-4" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-sm text-foreground group-hover:text-purple-300 transition-colors">
                    {s.title}
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* FRAMEWORK QUICKSTARTS (Resend style) */}
        <div className="flex flex-col gap-4 border-t border-border pt-10">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Framework Quickstarts</h2>
            <p className="text-xs text-muted-foreground">Deploy your preferred framework with zero manual configuration.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {FRAMEWORK_QUICKSTARTS.map((fw) => (
              <Link
                key={fw.name}
                href={fw.href}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                  fw.flag
                    ? "bg-purple-500/10 border-purple-500/30 text-purple-200 hover:bg-purple-500/20"
                    : "bg-muted/50 border-border text-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className="text-xs font-semibold">{fw.label}</span>
                <ArrowRight className="size-3 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
