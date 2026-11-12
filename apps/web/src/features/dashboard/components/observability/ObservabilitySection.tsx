import { UpsellBanner } from "@/components/dashboard/UpsellBanner";
import { EdgeSignalView } from "@/features/dashboard/components/observability/EdgeSignalView";
import { ObservabilityHeader } from "@/features/dashboard/components/observability/ObservabilityHeader";
import { ObservabilityOverview } from "@/features/dashboard/components/observability/ObservabilityOverview";
import { PlannedSignalView } from "@/features/dashboard/components/observability/PlannedSignalView";
import { UsageSignalView } from "@/features/dashboard/components/observability/UsageSignalView";
import { PageBody } from "@/features/dashboard/components/PageBody";
import { observabilityView } from "@/features/dashboard/constants/observability-views";
import type { AnalyticsRange } from "@/features/dashboard/types/analytics.types";
import { getAccountUsage } from "@/lib/services/account-usage.service";
import { getProjectAnalytics } from "@/lib/services/analytics.service";
import { getProjectObservability } from "@/lib/services/observability.service";

interface ObservabilitySectionProps {
  userId: string;
  username: string;
  projectId: string;
  projectName: string;
  projectSlug: string;
  requestedView?: string;
  range: AnalyticsRange;
  plusEnabled: boolean;
}

/** Routes `?view=` to its view and loads only the data that view needs. */
export async function ObservabilitySection(props: ObservabilitySectionProps) {
  const config = observabilityView(props.requestedView);
  const base = `/${props.username}/${props.projectSlug}`;
  const timeSeries =
    config.source === "overview" ||
    config.source === "edge" ||
    config.source === "transfer";

  let body: React.ReactNode;
  if (config.source === "overview") {
    const data = await getProjectObservability(
      props.userId,
      props.projectId,
      props.range,
    );
    body = <ObservabilityOverview base={base} data={data} />;
  } else if (config.source === "edge" || config.source === "transfer") {
    const data = await getProjectAnalytics(props.projectId, props.range);
    body = (
      <EdgeSignalView
        data={data}
        glyph={config.icon}
        mode={config.source === "edge" ? "requests" : "transfer"}
      />
    );
  } else if (config.source === "usage" && config.usage) {
    const usage = await getAccountUsage(props.userId, props.username);
    body = (
      <UsageSignalView
        icon={config.icon}
        rows={config.usage}
        title={config.label}
        usage={usage}
      />
    );
  } else {
    body = (
      <PlannedSignalView
        description={config.description}
        glyph={config.icon}
        title={config.label}
        tracks={config.tracks ?? []}
      />
    );
  }

  return (
    <PageBody>
      <ObservabilityHeader
        description={config.description}
        plusEnabled={props.plusEnabled}
        projectName={props.projectName}
        range={props.range}
        showRange={timeSeries}
        title={config.label}
        view={config.view}
      />
      {body}
      {props.plusEnabled || !timeSeries ? null : (
        <UpsellBanner
          cta="Turn on in Billing"
          description="Observability Plus keeps 30 days of signals and unlocks advanced queries."
          href={`/${props.username}/~/settings#billing`}
          title="Look back a month, not a day"
        />
      )}
    </PageBody>
  );
}
