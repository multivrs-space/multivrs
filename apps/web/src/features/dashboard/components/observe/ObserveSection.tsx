import { LiveBell, LiveHeartPulse } from "@/components/icons/animated";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { ErrorsPage } from "@/features/dashboard/components/errors/ErrorsPage";
import { ObservePlanned } from "@/features/dashboard/components/observe/ObservePlanned";
import { ObserveSources } from "@/features/dashboard/components/observe/ObserveSources";
import { observeScope } from "@/features/dashboard/components/observe/observe-scope";
import { PageBody } from "@/features/dashboard/components/PageBody";
import { ProductAnalyticsPage } from "@/features/dashboard/components/product/ProductAnalyticsPage";
import type { AnalyticsRange } from "@/features/dashboard/types/analytics.types";
import { listErrorIssues } from "@/lib/services/error-issues.service";
import { getProductAnalytics } from "@/lib/services/product-analytics.service";

export const OBSERVE_SECTIONS = [
  "product",
  "errors",
  "uptime",
  "alerts",
] as const;
export type ObserveSectionSlug = (typeof OBSERVE_SECTIONS)[number];

export function isObserveSection(value: string): value is ObserveSectionSlug {
  return OBSERVE_SECTIONS.some((section) => section === value);
}

const PLANNED = {
  uptime: {
    glyph: LiveHeartPulse,
    title: "Uptime",
    summary:
      "Checks that call your site or API from around the world and tell you the moment it stops answering.",
    features: [
      "Checks from several regions, on a schedule you pick",
      "Synthetic checks that sign in or check out, step by step",
      "History for every check, and a public status page",
    ],
    connect: [
      "Any URL, hosted on Multivrs or anywhere else",
      "Assertions on status, body text and response time",
      "Failures open an incident and raise an alert",
    ],
    external: "any URL",
  },
  alerts: {
    glyph: LiveBell,
    title: "Alerts",
    summary:
      "One place for every rule across errors, speed, uptime, traffic, usage and logs, and for who hears about it.",
    features: [
      "Rules that read as sentences: when 5xx is above 2% for 5 min",
      "Notices by email and webhook",
      "A firing history for every rule",
    ],
    connect: [
      "Works on every Observe signal, from any source",
      "Usage rules that warn before a plan limit",
      "Related alerts grouped into one incident",
    ],
    external: "any signal",
  },
} as const;

/** The Observe products with their own routes, for one project or all. */
export async function ObserveSection({
  section,
  username,
  scope,
  range,
}: {
  section: ObserveSectionSlug;
  username: string;
  scope: string;
  range: AnalyticsRange;
}) {
  const context = await observeScope(username, scope);
  if (section === "errors") {
    const { issues, events, truncated } = await listErrorIssues(context.ids);
    return (
      <ErrorsPage
        events={events}
        issues={issues}
        projects={context.links}
        scopeName={context.scopeName}
        truncated={truncated}
        workspace={context.workspace}
      />
    );
  }
  if (section === "product") {
    return (
      <ProductAnalyticsPage
        baseHref={context.baseHref}
        data={await getProductAnalytics(context.ids, range)}
        scopeName={context.scopeName}
        sources={context.ids.length}
      />
    );
  }
  const planned = PLANNED[section];
  return (
    <PageBody wide>
      <DashboardPageHeader
        description={planned.summary}
        eyebrow={`${context.scopeName} · Observe`}
        title={planned.title}
      />
      <ObserveSources
        external={planned.external}
        projects={context.ids.length}
      />
      <ObservePlanned
        connect={[...planned.connect]}
        features={[...planned.features]}
        glyph={planned.glyph}
        summary="Nothing is collecting yet, so there's nothing to show. Here's what this page will do."
        title={planned.title}
      />
    </PageBody>
  );
}
