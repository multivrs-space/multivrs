import { StatusOrb } from "@/components/dashboard/StatusOrb";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { FirewallRuleComposer } from "@/features/dashboard/components/FirewallRuleComposer";
import { FirewallRuleRows } from "@/features/dashboard/components/FirewallRuleRows";
import { PageBody } from "@/features/dashboard/components/PageBody";
import type { DashboardFirewallRule } from "@/features/dashboard/types/firewall-rule.types";

/** Ordered traffic rules for one project, enforced at the edge. */
export function FirewallPage({
  projectId,
  projectName,
  rules,
}: {
  projectId: string;
  projectName: string;
  rules: DashboardFirewallRule[];
}) {
  const active = rules.filter((rule) => rule.enabled).length;
  return (
    <PageBody>
      <DashboardPageHeader
        actions={
          <StatusOrb
            label={
              active
                ? `${active} ${active === 1 ? "rule" : "rules"} enforcing`
                : "No rules enforcing"
            }
            pill
            tone={active ? "ready" : "idle"}
          />
        }
        description="Block, allow, challenge or rate-limit requests before they reach your app. No redeploy needed."
        eyebrow={`${projectName} · Deliver`}
        title="Firewall"
      />
      <FirewallRuleComposer projectId={projectId} />
      <FirewallRuleRows projectId={projectId} rules={rules} />
    </PageBody>
  );
}
