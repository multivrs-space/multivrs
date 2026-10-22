"use client";

import {
  Bell,
  Command,
  FileText,
  Menu,
  Search,
  Sparkles,
  Terminal,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MultivrsMark } from "@/components/brand/Logo";
import SpecularButton from "@/components/SpecularButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { DocCategory } from "../types";

interface DocsHeaderProps {
  categories?: DocCategory[];
  onToggleMobileSidebar?: () => void;
  mobileSidebarOpen?: boolean;
}

export function DocsHeader({
  categories = [],
  onToggleMobileSidebar,
  mobileSidebarOpen = false,
}: DocsHeaderProps) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Keyboard shortcut: Press ⌘K or Ctrl+K to open search dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  // Flatten all doc items for instant client-side search
  const allDocItems = categories.flatMap((cat) => [
    ...cat.items.map((item) => ({
      title: item.title,
      href: item.href,
      category: cat.title,
      summary: item.summary,
      badge: item.badge,
    })),
    ...(cat.items.flatMap((item) =>
      (item.children || []).map((child) => ({
        title: child.title,
        href: child.href,
        category: `${cat.title} › ${item.title}`,
        summary: child.summary,
        badge: child.badge,
      }))
    ) || []),
  ]);

  const searchResults = searchQuery.trim()
    ? allDocItems.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allDocItems.slice(0, 8);

  const handleSelectResult = (href: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    router.push(href);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card backdrop-blur-md">
        <div className="w-full flex h-16 items-center">
          {/* Left: Branding Block with exact matching width & border-r to align seamlessly with sidebar */}
          <div className="w-72 lg:w-80 xl:w-[320px] shrink-0 h-full border-r border-border flex items-center justify-between px-4 sm:px-5">
            <Link
              href="/docs"
              className="flex items-center gap-3 group shrink-0"
              aria-label="Multivrs Documentation Home"
            >
              <div className="flex items-center justify-center text-foreground transition-transform group-hover:scale-105">
                <MultivrsMark className="size-7 text-foreground" />
              </div>
              <span className="font-clash text-[17px] font-bold tracking-wider text-foreground">
                MULTIVRS
              </span>
              <span className="px-2.5 py-0.5 rounded-md border border-border bg-muted/90 text-foreground text-[11px] font-mono font-semibold tracking-wider uppercase">
                DOCS
              </span>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-1.5 -mr-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
              aria-label="Toggle navigation menu"
            >
              {mobileSidebarOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
          </div>

          {/* Right: Cloudflare-style Nav Links + Search + Icons + Dashboard */}
          <div className="flex-1 flex h-full items-center justify-between px-6 sm:px-8 min-w-0">
            {/* Header Nav Links */}
            <nav className="hidden md:flex items-center gap-6 text-[13.5px] text-muted-foreground font-medium shrink-0">
              <Link
                href="/docs"
                className="hover:text-foreground transition-colors"
              >
                Directory
              </Link>
              <Link
                href="/docs/swift-rust"
                className="hover:text-foreground transition-colors flex items-center gap-1.5 font-semibold text-purple-300"
              >
                <span>swift-rust</span>
                <span className="text-xs">🦀</span>
              </Link>
              <Link
                href="/docs/api"
                className="hover:text-foreground transition-colors"
              >
                API
              </Link>
              <Link
                href="/docs/products/client"
                className="hover:text-foreground transition-colors"
              >
                SDKs
              </Link>
              <Link
                href="/docs/changelog"
                className="hover:text-foreground transition-colors"
              >
                Changelog
              </Link>
            </nav>

            {/* Right Tools: Search + Bell + Monitor + Dashboard Button */}
            <div className="flex items-center gap-3 sm:gap-4 ml-auto">
              {/* Search Trigger */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-3 px-3.5 py-2 rounded-lg bg-muted hover:bg-accent border border-border text-muted-foreground text-sm transition-all cursor-pointer shadow-sm group"
              >
                <Search className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="text-muted-foreground text-sm font-normal">Search</span>
                <div className="flex items-center gap-1 ml-2">
                  <kbd className="px-1.5 py-0.5 rounded bg-muted/90 border border-border text-[11px] font-mono text-muted-foreground">
                    ⌘
                  </kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-muted/90 border border-border text-[11px] font-mono text-muted-foreground">
                    K
                  </kbd>
                </div>
              </button>

              {/* Notification / Changelog Bell Icon */}
              <Link
                href="/docs/changelog"
                className="size-9 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors hidden sm:flex"
                title="Changelog & Updates"
              >
                <Bell className="size-4.5" />
              </Link>

              {/* Theme Toggle Component */}
              <div className="flex items-center">
                <ThemeToggle />
              </div>

              {/* Vertical Divider */}
              <div className="h-5 w-px bg-muted hidden sm:block mx-1" />

              {/* Dashboard Button */}
              <Link href="/account/settings">
                <SpecularButton
                  size="sm"
                  radius={9999}
                  tint="#ffffff"
                  tintOpacity={0.95}
                  baseColor="#ffffff"
                  lineColor="#ffffff"
                  textColor="#000000"
                  forceTheme="dark"
                  className="origin-right shadow-sm"
                >
                  <span className="font-semibold text-xs px-2 py-0.5">Dashboard</span>
                </SpecularButton>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Instant Search Command Palette Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-foreground/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-xl rounded-xl border border-border bg-popover shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-muted">
              <Search className="size-4.5 text-muted-foreground shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documentation, swift-rust, CLI, APIs..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-96 overflow-y-auto p-2 flex flex-col gap-1">
              {searchResults.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No matching documentation pages found for &quot;{searchQuery}&quot;
                </div>
              ) : (
                searchResults.map((item, idx) => (
                  <button
                    key={`${item.href}-${idx}`}
                    type="button"
                    onClick={() => handleSelectResult(item.href)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-left hover:bg-muted transition-colors group cursor-pointer"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-foreground group-hover:text-purple-300 transition-colors">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/60">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {item.summary || item.category}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground shrink-0">
                      {item.category}
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Footer with Hotkeys */}
            <div className="px-4 py-2 border-t border-border bg-muted flex items-center justify-between text-xs text-muted-foreground font-mono">
              <span>Select with click or Enter</span>
              <span>ESC to close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
