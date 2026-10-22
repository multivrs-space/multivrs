"use client";

import Image from "next/image";
import Link from "next/link";
import type { SanityLanguage } from "@/sanity/lib/languages.service";

interface SupportedLanguagesGridProps {
  languages: SanityLanguage[];
  viewAllHref?: string;
  limit?: number;
}

const FEATURED_ORDER = [
  "swift-rust",
  "next-js",
  "bun",
  "cloudflare-workers",
  "node-js",
  "express",
  "python",
  "go",
  "php",
  "laravel",
  "react",
  "ruby",
  "rails",
  "elixir",
  "java",
  "net",
  "rust",
  "hono",
  "cli",
];

export function SupportedLanguagesGrid({
  languages,
  viewAllHref = "/docs/mail/sending-examples",
  limit = 6,
}: SupportedLanguagesGridProps) {
  if (!languages || languages.length === 0) {
    return null;
  }

  // Sort by priority (featured list first)
  const sorted = [...languages].sort((a, b) => {
    const slugA = typeof a.slug === "string" ? a.slug : a.slug?.current || "";
    const slugB = typeof b.slug === "string" ? b.slug : b.slug?.current || "";
    const indexA = FEATURED_ORDER.indexOf(slugA);
    const indexB = FEATURED_ORDER.indexOf(slugB);
    const orderA = indexA === -1 ? 999 : indexA;
    const orderB = indexB === -1 ? 999 : indexB;
    return orderA - orderB;
  });

  const displayedLanguages = limit ? sorted.slice(0, limit) : sorted;

  return (
    <div className="flex flex-col gap-4 mt-6 w-full">
      {/* Header bar: SUPPORTED LANGUAGES & FRAMEWORKS + View all link */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono font-semibold tracking-wider text-zinc-400 uppercase">
          SUPPORTED LANGUAGES &amp; FRAMEWORKS
        </span>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors inline-flex items-center gap-1 group"
          >
            <span>View all sending examples</span>
            <span
              className="inline-block transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              &rarr;
            </span>
          </Link>
        )}
      </div>

      {/* 3-column Grid of Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {displayedLanguages.map((lang) => {
          const rawSlug = typeof lang.slug === "string" ? lang.slug : lang.slug?.current || "";
          const name = lang.name.trim();
          const iconUrl = lang.iconUrl || lang.iconUrlDark;

          // Format title: e.g. "swift-rust Quickstart", "Next.js Quickstart", "Cloudflare Workers"
          const title =
            name.toLowerCase().includes("quickstart") || name.toLowerCase().includes("workers")
              ? name
              : `${name} Quickstart`;

          const cardHref = `/docs/mail/sending-examples?lang=${rawSlug}`;

          return (
            <Link
              key={lang._id}
              href={cardHref}
              className="rounded-2xl border border-zinc-800/80 bg-[#0d0d10] hover:bg-[#131318] hover:border-zinc-700/80 p-5 flex flex-col justify-between min-h-[105px] transition-all group shadow-sm"
            >
              <div className="size-7 flex items-center">
                {iconUrl ? (
                  <Image
                    src={iconUrl}
                    alt={name}
                    width={26}
                    height={26}
                    className="size-6 object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="size-6 rounded bg-zinc-800 flex items-center justify-center text-xs font-mono text-zinc-400">
                    {name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                {title}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
