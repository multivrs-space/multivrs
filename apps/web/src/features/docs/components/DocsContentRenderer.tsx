"use client";

import Link from "next/link";
import SpecularButton from "@/components/SpecularButton";
import { DocPortableText } from "./DocPortableText";
import type { DocContent } from "../types";
import type { SanityLanguage } from "@/sanity/lib/languages.service";

interface DocsContentRendererProps {
  doc: DocContent;
  languages?: SanityLanguage[];
}

export function DocsContentRenderer({ doc, languages = [] }: DocsContentRendererProps) {
  return (
    <article className="w-full max-w-4xl px-8 lg:px-12 py-10 flex flex-col gap-8 text-foreground">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
        <Link href="/docs" className="hover:text-foreground transition-colors">
          Docs
        </Link>
        <span>/</span>
        {doc.categoryTitle && (
          <>
            <span className="text-muted-foreground">{doc.categoryTitle}</span>
            <span>/</span>
          </>
        )}
        <span className="text-purple-300 font-medium">{doc.title}</span>
      </nav>

      {/* 2. Header & Badges */}
      <div className="flex flex-col gap-3 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            {doc.title}
          </h1>
          {doc.badge && (doc.badge === "Coming soon" || (doc.badge as string) === "Soon") && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold border bg-muted text-foreground border-border/60">
              Coming soon
            </span>
          )}
        </div>

        {doc.summary && (
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
            {doc.summary}
          </p>
        )}

        {/* Action button */}
        <div className="pt-2 flex items-center gap-3">
          <Link href="/docs/quickstart">
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
              <span className="font-semibold text-xs">Deploy Now</span>
            </SpecularButton>
          </Link>
        </div>
      </div>

      {/* 3. Body Content: Rendered 100% from Sanity PortableText */}
      <div className="flex flex-col gap-6 text-sm leading-relaxed text-foreground">
        {doc.body && Array.isArray(doc.body) && doc.body.length > 0 ? (
          <DocPortableText value={doc.body} languages={languages} />
        ) : (
          <div className="flex flex-col gap-4 text-muted-foreground">
            <h2 id="overview" className="text-2xl font-bold text-foreground tracking-tight scroll-mt-24">
              Overview
            </h2>
            <p className="leading-relaxed text-base text-foreground">
              {doc.summary || "Comprehensive documentation and developer reference for this topic."}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
