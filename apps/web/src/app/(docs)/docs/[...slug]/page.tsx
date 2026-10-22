import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { DocsContentRenderer } from "@/features/docs/components/DocsContentRenderer";
import { DocsTOC } from "@/features/docs/components/DocsTOC";
import { getDocPageBySlug } from "@/sanity/lib/docs.service";
import { getSanityLanguages } from "@/sanity/lib/languages.service";
import { getDynamicFetchOptions, sanityFetchStaticParams } from "@/sanity/lib/live";
import { allDocPageSlugsQuery } from "@/sanity/lib/queries";

interface DocsSlugPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateStaticParams() {
  const { data } = await sanityFetchStaticParams({
    query: allDocPageSlugsQuery,
  });

  const paths: Array<{ slug: string[] }> = [];
  if (Array.isArray(data)) {
    for (const item of data as Array<{ slug?: string }>) {
      if (item?.slug && item.slug.trim()) {
        paths.push({ slug: item.slug.split("/") });
      }
    }
  }
  return paths;
}

export async function generateMetadata({ params }: DocsSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const slugPath = slug.join("/");
  const fetchOptions = await getDynamicFetchOptions();
  const doc = await getDocPageBySlug(slugPath, fetchOptions);

  if (!doc) {
    return {
      title: "Page Not Found · Multivrs Docs",
    };
  }

  return {
    title: `${doc.title} · Multivrs Docs`,
    description: doc.summary || "Multivrs developer documentation and API reference.",
  };
}

function extractHeadings(body: any): Array<{ id: string; text: string; level: number }> {
  if (!Array.isArray(body)) return [];
  const headings: Array<{ id: string; text: string; level: number }> = [];

  for (const block of body) {
    if (block._type === "block" && (block.style === "h2" || block.style === "h3")) {
      const text = block.children?.map((c: any) => c.text).join("") || "";
      if (text.trim()) {
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        headings.push({
          id,
          text,
          level: block.style === "h2" ? 2 : 3,
        });
      }
    }
  }

  return headings;
}

async function SlugContent({ paramsPromise }: { paramsPromise: Promise<{ slug: string[] }> }) {
  const { slug } = await paramsPromise;
  const slugPath = slug.join("/");
  const fetchOptions = await getDynamicFetchOptions();
  const [doc, languages] = await Promise.all([
    getDocPageBySlug(slugPath, fetchOptions),
    getSanityLanguages(fetchOptions),
  ]);

  if (!doc) {
    notFound();
  }

  const headings = extractHeadings(doc.body);

  return (
    <div className="flex w-full min-h-[calc(100vh-4rem)]">
      {/* Main Content Area: Purely rendered from Sanity */}
      <main className="flex-1 min-w-0 flex justify-center">
        <DocsContentRenderer doc={doc} languages={languages} />
      </main>

      {/* Right On This Page TOC extracted dynamically from document headings */}
      {headings.length > 0 && <DocsTOC headings={headings} />}
    </div>
  );
}

export default function DocsSlugPage({ params }: DocsSlugPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex w-full min-h-screen">
          <div className="flex-1 p-10 animate-pulse bg-zinc-950" />
        </div>
      }
    >
      <SlugContent paramsPromise={params} />
    </Suspense>
  );
}
