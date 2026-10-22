"use client";

import { useState } from "react";
import { DocsHeader } from "./DocsHeader";
import { DocsSidebar } from "./DocsSidebar";
import type { DocCategory } from "../types";

interface DocsShellProps {
  categories: DocCategory[];
  children: React.ReactNode;
}

export function DocsShell({ categories, children }: DocsShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-black text-white antialiased flex flex-col">
      <DocsHeader
        categories={categories}
        mobileSidebarOpen={mobileMenuOpen}
        onToggleMobileSidebar={() => setMobileMenuOpen((prev) => !prev)}
      />

      <div className="w-full flex-1 flex min-h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar: stays permanently mounted in the layout, preserving all open/closed states across page navigation */}
        <div className="hidden lg:block shrink-0">
          <DocsSidebar categories={categories} currentFramework="swift-rust" />
        </div>

        {/* Mobile Sidebar Overlay Drawer */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="w-80 max-w-[85vw] h-full bg-[#0a0a0c] border-r border-zinc-800 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <DocsSidebar
                categories={categories}
                showMobileHeader={true}
                currentFramework="swift-rust"
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
