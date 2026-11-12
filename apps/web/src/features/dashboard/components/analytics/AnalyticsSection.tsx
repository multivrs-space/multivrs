import { AnalyticsPage } from "@/features/dashboard/components/AnalyticsPage";
import type { AnalyticsRange } from "@/features/dashboard/types/analytics.types";
import type { DashboardProject } from "@/features/dashboard/types/project.types";
import { getProjectAnalytics } from "@/lib/services/analytics.service";
import { getAnalyticsAudience } from "@/lib/services/analytics-audience.service";
import { getPreviousAnalyticsTotals } from "@/lib/services/analytics-comparison.service";
import {
  entitledAnalyticsRange,
  getProjectBillingFeatures,
} from "@/lib/services/billing-feature-access.service";

/** One project's Web Analytics: traffic, the period before it, and its audience. */
export async function AnalyticsSection({
  userId,
  username,
  projectId,
  selected,
  requestedRange,
}: {
  userId: string;
  username: string;
  projectId: string;
  selected: DashboardProject;
  requestedRange: AnalyticsRange;
}) {
  const features = await getProjectBillingFeatures(userId, projectId);
  const range = entitledAnalyticsRange(
    requestedRange,
    features.webAnalyticsPlus,
  );
  const [analytics, previous, audience] = await Promise.all([
    getProjectAnalytics(projectId, range, features.webAnalyticsPlus),
    getPreviousAnalyticsTotals(projectId, range),
    getAnalyticsAudience(projectId, range),
  ]);
  return (
    <AnalyticsPage
      analytics={{ ...analytics, previous }}
      audience={audience}
      plusEnabled={features.webAnalyticsPlus}
      project={selected}
      username={username}
    />
  );
}
