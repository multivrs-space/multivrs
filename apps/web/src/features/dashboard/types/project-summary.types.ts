import type { ProjectStatus } from "@/features/dashboard/types/project.types";

/** What the project sidebar shows: identity, live state and section counts. */
export interface ProjectNavSummary {
  name: string;
  slug: string;
  faviconUrl: string | null;
  /** "acme.com" or "acme.multivrs.app"; null before the first deploy. */
  siteLabel: string | null;
  status: ProjectStatus;
  /** Keyed by section slug: domains, environment-variables, firewall… */
  counts: Record<string, number>;
}
