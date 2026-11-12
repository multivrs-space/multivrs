import { projectUrl } from "@/lib/services/serve.service";
import { SITE_URL } from "@/lib/site";

/** `/favicon.ico` on a site, or null for an address that won't parse. */
export function faviconUrl(siteUrl: string): string | null {
  try {
    return new URL("/favicon.ico", new URL(siteUrl, SITE_URL)).toString();
  } catch {
    return null;
  }
}

/**
 * A project's logo, read from its live site. Only when production is
 * serving: asking a site that never went live just hangs the image.
 */
export function projectFavicon(project: {
  slug: string;
  productionDeploymentId: string | null;
  hostname: string | null;
}): string | null {
  if (!project.productionDeploymentId) return null;
  const site = project.hostname
    ? `https://${project.hostname}`
    : projectUrl(project.slug);
  return site ? faviconUrl(site) : null;
}
