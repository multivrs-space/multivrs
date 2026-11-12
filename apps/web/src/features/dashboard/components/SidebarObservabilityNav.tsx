"use client";

import { useSearchParams } from "next/navigation";
import { LiveRadar } from "@/components/icons/animated";
import {
  ContextNavGroup,
  ContextNavHeader,
  ContextNavItem,
  ContextNavList,
} from "@/features/dashboard/components/shell/ContextNav";
import { OBSERVABILITY_NAVIGATION } from "@/features/dashboard/constants/observability-navigation";
import { useDashboardScope } from "@/features/dashboard/lib/useDashboardScope";

export function SidebarObservabilityNav({
  onLinkClick,
  onBack,
}: {
  onLinkClick?: () => void;
  onBack?: () => void;
} = {}) {
  const { username, scope } = useDashboardScope();
  const searchParams = useSearchParams();
  const activeView = searchParams.get("view") ?? "overview";
  const backHref = scope === "~" ? `/${username}` : `/${username}/${scope}`;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ContextNavHeader
        backHref={backHref}
        icon={LiveRadar}
        onBack={onBack}
        title="Monitoring"
      />
      <ContextNavList>
        {OBSERVABILITY_NAVIGATION.filter(
          (item) => !("panel" in item && item.panel === false),
        ).map((item) =>
          "divider" in item ? (
            <ContextNavGroup key={item.divider} label={item.divider} />
          ) : (
            <ContextNavItem
              active={activeView === item.view}
              href={`/${username}/${scope}/observability?view=${item.view}`}
              icon={item.icon}
              key={item.view}
              label={item.label}
              onClick={() => onLinkClick?.()}
            />
          ),
        )}
      </ContextNavList>
    </div>
  );
}
