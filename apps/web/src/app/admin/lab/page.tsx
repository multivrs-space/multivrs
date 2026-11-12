import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DashCard } from "@/components/dashboard/DashCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import {
  LiveActivity,
  LiveAtSign,
  LiveRocket,
  LiveShieldCheck,
} from "@/components/icons/animated";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AnalyticsDashboard } from "@/features/dashboard/components/analytics/AnalyticsDashboard";
import { DeploymentsBoard } from "@/features/dashboard/components/deployments/DeploymentsBoard";
import { LogsPage } from "@/features/dashboard/components/LogsPage";
import { OverviewPageSkeleton } from "@/features/dashboard/components/overview/OverviewSkeletons";
import { ProjectOverviewPage } from "@/features/dashboard/components/ProjectOverviewPage";
import { ProjectsUsageSkeleton } from "@/features/dashboard/components/skeletons/ProjectCardsSkeleton";
import { AtRequestTime } from "@/features/dashboard/lab/AtRequestTime";
import { ICON_COUNT, IconGallery } from "@/features/dashboard/lab/IconGallery";
import { LabMailSamples } from "@/features/dashboard/lab/LabMailSamples";
import { LabNewProjectSamples } from "@/features/dashboard/lab/LabNewProjectSamples";
import { LabObserveSamples } from "@/features/dashboard/lab/LabObserveSamples";
import { LabOverviewSamples } from "@/features/dashboard/lab/LabOverviewSamples";
import { LabSamples } from "@/features/dashboard/lab/LabSamples";
import { LabSettingsSamples } from "@/features/dashboard/lab/LabSettingsSamples";
import { LabSpeedSamples } from "@/features/dashboard/lab/LabSpeedSamples";
import { LabUsageSamples } from "@/features/dashboard/lab/LabUsageSamples";
import {
  LAB_ANALYTICS,
  LAB_AUDIENCE,
} from "@/features/dashboard/lab/lab-analytics-data";
import {
  LAB_LOG_PROJECTS,
  LAB_LOGS,
} from "@/features/dashboard/lab/lab-logs-data";
import { LAB_DEPLOYMENTS } from "@/features/dashboard/lab/lab-overview-data";
import { LAB_PROJECT_OVERVIEW } from "@/features/dashboard/lab/lab-project-data";
import { geistMono, hankenGrotesk } from "@/lib/dashboard-fonts";

export const metadata: Metadata = {
  title: "Design lab",
  robots: { index: false, follow: false },
};

/**
 * Development-only bench for the dashboard design system: every animated
 * icon, the surfaces, charts and live 3D tiles, in either theme. `admin` is a
 * reserved username, so this path can never shadow a workspace.
 */
export default function DesignLabPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div
      className={`${hankenGrotesk.variable} ${geistMono.variable} dashboard-surface dashboard-frame min-h-dvh bg-ink-raised text-foreground dark:bg-ink`}
    >
      <main className="mx-auto max-w-[1280px] space-y-10 px-5 py-10">
        <header className="flex items-end justify-between gap-4">
          <div>
            <p className="font-geist-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
              Multivrs dashboard
            </p>
            <h1 className="mt-1.5 text-[32px] font-semibold tracking-[-0.03em]">
              Design lab
            </h1>
          </div>
          <ThemeToggle />
        </header>

        <section className="space-y-3" id="project-overview">
          <h2 className="text-sm font-semibold">
            Project overview (sample data)
          </h2>
          <Suspense fallback={null}>
            <AtRequestTime>
              <ProjectOverviewPage
                data={LAB_PROJECT_OVERVIEW}
                username="acme"
              />
            </AtRequestTime>
          </Suspense>
        </section>

        <section className="space-y-3" id="new-project">
          <h2 className="text-sm font-semibold">New project (sample data)</h2>
          <Suspense fallback={null}>
            <AtRequestTime>
              <LabNewProjectSamples />
            </AtRequestTime>
          </Suspense>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Living icons ({ICON_COUNT})</h2>
          <p className="text-[13px] text-muted-foreground">
            Hover a tile. Parts move; the icon never shifts.
          </p>
          <IconGallery />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Live 3D tiles</h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              { glyph: LiveActivity, title: "Waiting for the first visit" },
              { glyph: LiveRocket, title: "No deployments yet" },
              { glyph: LiveAtSign, title: "No sent emails yet" },
              { glyph: LiveShieldCheck, title: "No firewall rules" },
            ].map((item) => (
              <DashCard key={item.title}>
                <EmptyState
                  description="Sample empty state."
                  glyph={item.glyph}
                  title={item.title}
                />
              </DashCard>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold">
            Cards and charts (sample data)
          </h2>
          <LabSamples />
          <LabSpeedSamples />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Observe (sample data)</h2>
          <Suspense fallback={null}>
            <AtRequestTime>
              <LabObserveSamples />
            </AtRequestTime>
          </Suspense>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Web Analytics (sample data)</h2>
          <AnalyticsDashboard
            audience={LAB_AUDIENCE}
            data={LAB_ANALYTICS}
            plusEnabled
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold">
            Workspace overview (sample data)
          </h2>
          <Suspense fallback={null}>
            <LabOverviewSamples />
          </Suspense>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Usage (sample data)</h2>
          <Suspense fallback={null}>
            <LabUsageSamples />
          </Suspense>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Deployments (sample data)</h2>
          <Suspense fallback={null}>
            <DeploymentsBoard
              deployments={Promise.resolve(LAB_DEPLOYMENTS)}
              workspace
            />
          </Suspense>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Logs (sample data)</h2>
          <LogsPage
            baseHref="/acme/~"
            data={LAB_LOGS}
            projects={LAB_LOG_PROJECTS}
            scopeName="acme"
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Usage skeleton</h2>
          <ProjectsUsageSkeleton />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Workspace overview skeleton</h2>
          <OverviewPageSkeleton />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Settings (sample data)</h2>
          <Suspense fallback={null}>
            <AtRequestTime>
              <LabSettingsSamples />
            </AtRequestTime>
          </Suspense>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Mail (sample data)</h2>
          <Suspense fallback={null}>
            <LabMailSamples />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
