import type { ReactNode } from "react";

interface DashboardCanvasProps {
  topbar: ReactNode;
  children: ReactNode;
}

/**
 * The framed page surface. On large screens it floats inside the frame with
 * an 8px inset and scrolls on its own, so the rail and context panel stay put
 * and the top bar sticks to the canvas edge. Below `lg` it is the page.
 */
export function DashboardCanvas({ topbar, children }: DashboardCanvasProps) {
  return (
    <div
      className="relative min-w-0 [scrollbar-width:thin] lg:fixed lg:top-(--canvas-inset) lg:right-(--canvas-inset) lg:bottom-(--canvas-inset) lg:left-[calc(var(--rail-w)+var(--context-w)+var(--canvas-inset))] lg:overflow-x-hidden lg:overflow-y-auto lg:rounded-canvas lg:surface-canvas lg:transition-[left] lg:duration-300 lg:ease-out-expo"
      data-dashboard-canvas
    >
      {topbar}
      <main className="min-h-(--dash-content-h) min-w-0 max-w-full">
        {children}
      </main>
    </div>
  );
}
