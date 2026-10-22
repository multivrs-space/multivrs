import { cacheTag } from "next/cache";
import type { DocCategory, DocContent, DocItem, DocSubItem } from "@/features/docs/types";
import { type DynamicFetchOptions, sanityFetch } from "./live";
import { docPageBySlugQuery, docsNavigationQuery } from "./queries";

export const DOCS_NAVIGATION_TAG = "sanity:docs-navigation";
export const DOCS_PAGE_TAG = "sanity:docs-page";

interface RawNavChild {
  _id: string;
  title: string;
  slug: string;
  badge?: string;
  order?: number;
  icon?: string;
  summary?: string;
}

interface RawNavItem {
  _id: string;
  title: string;
  slug: string;
  badge?: string;
  order?: number;
  icon?: string;
  summary?: string;
  children?: RawNavChild[];
}

interface RawNavCategory {
  _id: string;
  title: string;
  slug: string;
  icon?: string;
  order?: number;
  description?: string;
  items?: RawNavItem[];
}

export async function getDocsNavigation(
  options: DynamicFetchOptions = { perspective: "published", stega: false },
): Promise<DocCategory[]> {
  "use cache";
  cacheTag(DOCS_NAVIGATION_TAG);

  try {
    const { data } = await sanityFetch({
      query: docsNavigationQuery,
      perspective: options.perspective,
      stega: options.stega,
    });

    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    const categories: DocCategory[] = (data as RawNavCategory[]).map((cat) => {
      const items: DocItem[] = (cat.items || []).map((item) => {
        const children: DocSubItem[] = (item.children || []).map((child) => ({
          id: child._id,
          title: child.title,
          slug: child.slug,
          href: `/docs/${child.slug}`,
          summary: child.summary,
          badge: child.badge as any,
        }));

        const hasChildren = children.length > 0;
        return {
          id: item._id,
          title: item.title,
          slug: item.slug,
          href: item.slug ? `/docs/${item.slug}` : "/docs",
          summary: item.summary,
          icon: item.icon,
          badge: item.badge as any,
          order: item.order ?? 99,
          hasChevron: hasChildren,
          children: hasChildren ? children : undefined,
        };
      });

      return {
        id: cat._id,
        title: cat.title,
        slug: cat.slug,
        icon: cat.icon,
        order: cat.order ?? 99,
        items,
      };
    });

    return categories.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.warn("Failed to fetch docs navigation from Sanity Live:", error);
    return [];
  }
}

export async function getDocPageBySlug(
  slug: string,
  options: DynamicFetchOptions = { perspective: "published", stega: false },
): Promise<DocContent | null> {
  "use cache";
  cacheTag(DOCS_PAGE_TAG);
  const normalizedSlug = slug.replace(/^\/+|\/+$/g, "");

  try {
    const { data } = await sanityFetch({
      query: docPageBySlugQuery,
      params: { slug: normalizedSlug },
      perspective: options.perspective,
      stega: options.stega,
    });

    const sanityDoc = data as any;
    if (sanityDoc) {
      const categoryTitle = sanityDoc.parent?.title
        ? `${sanityDoc.category?.title ?? ""} › ${sanityDoc.parent.title}`
        : sanityDoc.category?.title;

      return {
        _id: sanityDoc._id,
        title: sanityDoc.title,
        slug: sanityDoc.slug ?? normalizedSlug,
        summary: sanityDoc.summary,
        badge: sanityDoc.badge,
        icon: sanityDoc.icon,
        categoryTitle,
        categorySlug: sanityDoc.category?.slug,
        body: sanityDoc.body,
      };
    }
  } catch (error) {
    console.warn("Failed to fetch doc page from Sanity Live:", error);
  }

  return null;
}
