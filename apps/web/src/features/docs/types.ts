export type DocsBadge = "Flagship" | "New" | "Beta" | "Coming soon" | "Popular" | "Soon";

export interface DocSubItem {
  id: string;
  title: string;
  slug: string;
  href: string;
  summary?: string;
  badge?: DocsBadge;
}

export interface DocItem {
  id: string;
  title: string;
  slug: string;
  href: string;
  summary?: string;
  icon?: string;
  prefix?: string;
  badge?: DocsBadge;
  hasChevron?: boolean;
  order: number;
  children?: DocSubItem[];
}

export interface DocCategory {
  id: string;
  title: string;
  slug: string;
  icon?: string;
  order: number;
  items: DocItem[];
}

export interface DocContent {
  _id?: string;
  title: string;
  slug: string;
  summary?: string;
  categoryTitle?: string;
  categorySlug?: string;
  badge?: DocsBadge;
  icon?: string;
  readTime?: string;
  body?: any[];
  headings?: Array<{ id: string; text: string; level: number }>;
}
