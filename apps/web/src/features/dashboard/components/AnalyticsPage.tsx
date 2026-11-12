import { DashCard } from "@/components/dashboard/DashCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { UpsellBanner } from "@/components/dashboard/UpsellBanner";
import { LiveActivity, LiveShieldAlert } from "@/components/icons/animated";
import { AnalyticsProjectPicker } from "@/features/dashboard/components/AnalyticsProjectPicker";
import { AnalyticsDashboard } from "@/features/dashboard/components/analytics/AnalyticsDashboard";
import { AnalyticsHeader } from "@/features/dashboard/components/analytics/AnalyticsHeader";
import { PageBody } from "@/features/dashboard/components/PageBody";
import type {
  AnalyticsAudience,
  PlatformAnalytics,
} from "@/features/dashboard/types/analytics.types";
import type { DashboardProject } from "@/features/dashboard/types/project.types";

interface AnalyticsPageProps {
  username?: string;
  projects?: DashboardProject[];
  project?: DashboardProject;
  analytics?: PlatformAnalytics;
  audience?: AnalyticsAudience;
  plusEnabled?: boolean;
}

const NO_AUDIENCE: AnalyticsAudience = {
  live: 0,
  countries: [],
  cities: [],
  browsers: [],
  events: [],
};

const UNAVAILABLE = {
  unconfigured: {
    title: "Analytics isn't connected here",
    description:
      "Analytics isn't set up in this environment, so there's no traffic to read yet.",
  },
  error: {
    title: "Analytics didn't load",
    description:
      "Analytics didn't answer this time. Nothing is lost; try again in a moment.",
  },
  locked: {
    title: "Analytics is locked",
    description: "Turn on Web Analytics for this team to see traffic.",
  },
} as const;

/** Web Analytics: who visits, from where, what they read and how it changes. */
export function AnalyticsPage({
  username,
  projects,
  project,
  analytics,
  audience = NO_AUDIENCE,
  plusEnabled = false,
}: AnalyticsPageProps) {
  if (username && projects && !project) {
    return <AnalyticsProjectPicker username={username} projects={projects} />;
  }

  const billingHref = username ? `/${username}/~/settings#billing` : "#billing";
  const data = analytics;
  const issue = !data
    ? UNAVAILABLE.unconfigured
    : data.state === "ready"
      ? null
      : UNAVAILABLE[data.state];
  const empty =
    data?.state === "ready" && data.requests === 0 && data.pageviews === 0;

  return (
    <PageBody>
      <AnalyticsHeader
        plusEnabled={plusEnabled}
        projectName={project?.name}
        range={data?.range}
      />

      {issue || !data ? (
        <DashCard>
          <EmptyState
            description={(issue ?? UNAVAILABLE.unconfigured).description}
            glyph={data?.state === "error" ? LiveShieldAlert : LiveActivity}
            title={(issue ?? UNAVAILABLE.unconfigured).title}
          />
        </DashCard>
      ) : empty ? (
        <DashCard>
          <EmptyState
            description="Traffic appears here within a minute of your project's first visit. Share its address to get the first one in."
            glyph={LiveActivity}
            title="Waiting for the first visit"
          />
        </DashCard>
      ) : (
        <AnalyticsDashboard
          audience={audience}
          data={data}
          plusEnabled={plusEnabled}
        />
      )}

      {plusEnabled ? null : (
        <UpsellBanner
          cta="Turn on in Billing"
          description="Web Analytics Plus adds a 30-day range and UTM source attribution."
          href={billingHref}
          title="See 30 days of history and where campaigns convert"
        />
      )}
    </PageBody>
  );
}
