import { cacheTag } from "next/cache";
import { type DynamicFetchOptions, sanityFetch } from "./live";
import { languagesQuery } from "./queries";

export const LANGUAGES_TAG = "sanity:languages";

export interface SanityLanguage {
  _id: string;
  name: string;
  slug: string | { current: string };
  iconUrl?: string;
  iconUrlDark?: string;
}

export async function getSanityLanguages(
  options: DynamicFetchOptions = { perspective: "published", stega: false },
): Promise<SanityLanguage[]> {
  "use cache";
  cacheTag(LANGUAGES_TAG);

  try {
    const { data } = await sanityFetch({
      query: languagesQuery,
      perspective: options.perspective,
      stega: options.stega,
    });
    return (data as SanityLanguage[]) || [];
  } catch (error) {
    console.warn("Failed to fetch languages from Sanity Live:", error);
    return [];
  }
}
