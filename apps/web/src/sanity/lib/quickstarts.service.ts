import { cacheLife, cacheTag } from "next/cache";
import { sanityFetch } from "./live";
import { mailQuickstartsQuery } from "./queries";

export const MAIL_QUICKSTARTS_TAG = "sanity:mail-quickstarts";

export interface SanityMailQuickstart {
  _id: string;
  title: string;
  slug: string | { current: string };
  category?: string;
  order: number;
  summary?: string;
  installCommand?: string;
  filename?: string;
  codeLanguage?: string;
  codeSnippet?: string;
  language?: {
    _id: string;
    name: string;
    slug?: string | { current: string };
    iconUrl?: string;
    iconUrlDark?: string;
  };
}

export async function getSanityMailQuickstarts(): Promise<SanityMailQuickstart[]> {
  "use cache";
  cacheLife("max");
  cacheTag(MAIL_QUICKSTARTS_TAG);

  try {
    const { data } = await sanityFetch({
      query: mailQuickstartsQuery,
      perspective: "published",
      stega: false,
    });
    return (data as SanityMailQuickstart[]) || [];
  } catch (error) {
    console.warn("Failed to fetch mailQuickstarts from Sanity Live:", error);
    return [];
  }
}
