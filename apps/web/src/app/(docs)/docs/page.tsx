import { Suspense } from "react";
import { DocsHubPage } from "@/features/docs/components/DocsHubPage";
import { getDocsNavigation } from "@/sanity/lib/docs.service";
import { getDynamicFetchOptions } from "@/sanity/lib/live";

async function DocsHubContent() {
  const fetchOptions = await getDynamicFetchOptions();
  const categories = await getDocsNavigation(fetchOptions);
  return <DocsHubPage categories={categories} />;
}

export default function DocsRootPage() {
  return (
    <main className="w-full flex-1 min-w-0">
      <Suspense fallback={<div className="w-full min-h-screen animate-pulse bg-zinc-950" />}>
        <DocsHubContent />
      </Suspense>
    </main>
  );
}
