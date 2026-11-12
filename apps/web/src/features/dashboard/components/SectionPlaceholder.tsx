import { DashCard } from "@/components/dashboard/DashCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LiveSparkles } from "@/components/icons/animated";
import { DashboardPageHeader } from "./DashboardPageHeader";

interface SectionPlaceholderProps {
  title: string;
  description?: string;
  scopeLabel: string;
}

/** Keeps a section's route real while its data UI is still being built. */
export function SectionPlaceholder({
  title,
  description,
  scopeLabel,
}: SectionPlaceholderProps) {
  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-5 px-4 py-5 lg:px-6 lg:py-6">
      <DashboardPageHeader description={description} title={title} />
      <DashCard>
        <EmptyState
          description={`${title} for ${scopeLabel.toLowerCase()} is on its way. The route is live; the view lands next.`}
          glyph={LiveSparkles}
          title="Coming soon"
        />
      </DashCard>
    </div>
  );
}
