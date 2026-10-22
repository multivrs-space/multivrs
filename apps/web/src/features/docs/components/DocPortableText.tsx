"use client";

import { Check, Copy, ExternalLink, Info, Sparkles, AlertTriangle, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PortableText, type PortableTextComponents } from "next-sanity";
import { SupportedLanguagesGrid } from "./SupportedLanguagesGrid";
import type { SanityLanguage } from "@/sanity/lib/languages.service";

function CodeBlockRenderer({ value }: { value: any }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value?.code || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border bg-muted overflow-hidden my-3 shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card text-xs font-mono text-muted-foreground">
        <span className="text-foreground font-medium">
          {value?.filename || value?.language || "Code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted hover:bg-muted text-foreground hover:text-foreground transition-colors cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-emerald-400" />
              <span className="text-[11px] text-emerald-400 font-sans">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              <span className="text-[11px] font-sans">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 sm:p-5 overflow-x-auto text-[12.5px] font-mono leading-relaxed text-foreground bg-card">
        <code>{value?.code}</code>
      </pre>
    </div>
  );
}

function CalloutRenderer({ value }: { value: any }) {
  const tone = value?.tone || "tip";

  let borderClass = "border-purple-500/30 bg-purple-500/10";
  let icon = <Sparkles className="size-4 text-purple-400 shrink-0 mt-0.5" />;
  let titleColor = "text-purple-200";

  if (tone === "warning") {
    borderClass = "border-amber-500/30 bg-amber-500/10";
    icon = <AlertTriangle className="size-4 text-amber-400 shrink-0 mt-0.5" />;
    titleColor = "text-amber-200";
  } else if (tone === "caution") {
    borderClass = "border-rose-500/30 bg-rose-500/10";
    icon = <ShieldAlert className="size-4 text-rose-400 shrink-0 mt-0.5" />;
    titleColor = "text-rose-200";
  } else if (tone === "note") {
    borderClass = "border-blue-500/30 bg-blue-500/10";
    icon = <Info className="size-4 text-blue-400 shrink-0 mt-0.5" />;
    titleColor = "text-blue-200";
  }

  return (
    <div className={`p-4 rounded-xl border ${borderClass} backdrop-blur-md flex items-start gap-3 my-3`}>
      {icon}
      <div className="flex flex-col gap-1 text-xs sm:text-sm">
        {value?.title && (
          <span className={`font-semibold ${titleColor}`}>{value.title}</span>
        )}
        <p className="text-foreground leading-relaxed">{value?.message}</p>
      </div>
    </div>
  );
}

export const docPortableTextComponents: PortableTextComponents = {
  block: {
    h2: ({ children }) => {
      const text = typeof children === "string" ? children : Array.isArray(children) ? children.join("") : "";
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return (
        <h2
          id={id || undefined}
          className="text-2xl font-bold text-foreground tracking-tight scroll-mt-24 pt-6 border-t border-border first:border-t-0 first:pt-0"
        >
          {children}
        </h2>
      );
    },
    h3: ({ children }) => {
      const text = typeof children === "string" ? children : Array.isArray(children) ? children.join("") : "";
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return (
        <h3
          id={id || undefined}
          className="text-lg font-semibold text-foreground tracking-tight scroll-mt-24 pt-4"
        >
          {children}
        </h3>
      );
    },
    h4: ({ children }) => (
      <h4 className="text-base font-semibold text-foreground tracking-tight pt-2">
        {children}
      </h4>
    ),
    normal: ({ children }) => (
      <p className="text-[15px] text-foreground leading-relaxed">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-purple-500/70 pl-4 py-1 text-muted-foreground italic">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-5 space-y-2 text-foreground marker:text-muted-foreground text-[15px]">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-5 space-y-2 text-foreground marker:text-muted-foreground text-[15px]">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic text-foreground">{children}</em>
    ),
    code: ({ children }) => (
      <code className="px-1.5 py-0.5 rounded bg-muted text-purple-300 font-mono text-xs">
        {children}
      </code>
    ),
    link: ({ children, value }) => {
      const href = value?.href || "#";
      const isInternal = href.startsWith("/") || href.startsWith("#");

      if (isInternal) {
        return (
          <Link
            href={href}
            className="underline underline-offset-4 decoration-border hover:decoration-foreground text-foreground font-medium transition-colors"
          >
            {children}
          </Link>
        );
      }

      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 decoration-border hover:decoration-foreground text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1 transition-colors"
        >
          <span>{children}</span>
          <ExternalLink className="size-3 inline" />
        </a>
      );
    },
  },
  types: {
    codeBlock: CodeBlockRenderer,
    callout: CalloutRenderer,
  },
};

export function DocPortableText({
  value,
  languages = [],
}: {
  value: any;
  languages?: SanityLanguage[];
}) {
  if (!value) return null;

  const components: PortableTextComponents = {
    ...docPortableTextComponents,
    types: {
      ...docPortableTextComponents.types,
      quickstartEmbed: () => (
        <SupportedLanguagesGrid languages={languages} />
      ),
    },
  };

  const hasQuickstartEmbed =
    Array.isArray(value) && value.some((b: any) => b._type === "quickstartEmbed");
  const hasQuickstartHeading =
    Array.isArray(value) &&
    value.some(
      (b: any) =>
        b._type === "block" &&
        b.style === "h2" &&
        b.children?.some((c: any) => c.text?.toLowerCase().includes("quickstart")),
    );

  return (
    <>
      <PortableText value={value} components={components} />
      {/* If the Sanity document has a Quickstart section but author has not placed the quickstartEmbed block yet */}
      {!hasQuickstartEmbed && hasQuickstartHeading && languages.length > 0 && (
        <SupportedLanguagesGrid languages={languages} />
      )}
    </>
  );
}
