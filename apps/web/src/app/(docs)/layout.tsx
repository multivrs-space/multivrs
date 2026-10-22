import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { Suspense } from "react";
import { VisualEditing } from "next-sanity/visual-editing";
import { DocsShell } from "@/features/docs/components/DocsShell";
import { acari, clashDisplay } from "@/lib/marketing-fonts";
import { getDocsNavigation } from "@/sanity/lib/docs.service";
import { getDynamicFetchOptions, SanityLive } from "@/sanity/lib/live";

export const metadata: Metadata = {
  title: "Documentation · Multivrs",
  description:
    "Comprehensive guides, API references, and quickstarts for the Multivrs serverless edge platform.",
};

async function ShellWrapper({ children }: { children: React.ReactNode }) {
  const fetchOptions = await getDynamicFetchOptions();
  const categories = await getDocsNavigation(fetchOptions);
  return <DocsShell categories={categories}>{children}</DocsShell>;
}

export default async function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isEnabled: isDraftMode } = await draftMode();

  return (
    <div
      className={`min-h-screen w-full bg-background text-foreground antialiased flex flex-col ${acari.variable} ${clashDisplay.variable}`}
    >
      <Suspense
        fallback={
          <div className="min-h-screen w-full bg-background text-foreground flex flex-col">
            <div className="h-16 w-full border-b border-border bg-card" />
            <div className="flex-1 flex">
              <div className="w-72 lg:w-80 xl:w-[320px] border-r border-border bg-card animate-pulse p-4" />
              <div className="flex-1 p-8 animate-pulse bg-card" />
            </div>
          </div>
        }
      >
        <ShellWrapper>{children}</ShellWrapper>
      </Suspense>
      <SanityLive includeDrafts={isDraftMode} />
      {isDraftMode && <VisualEditing />}
    </div>
  );
}
