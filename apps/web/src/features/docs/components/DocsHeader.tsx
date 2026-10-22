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
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-[#0a0a0a] backdrop-blur-md">
        <div className="w-full flex h-16 items-center">
          {/* Left: Branding Block with exact matching width & border-r to align seamlessly with sidebar */}
          <div className="w-72 lg:w-80 xl:w-[320px] shrink-0 h-full border-r border-zinc-800/80 flex items-center justify-between px-4 sm:px-5">
            <Link
              href="/docs"
              className="flex items-center gap-3 group shrink-0"
              aria-label="Multivrs Documentation Home"
            >
              <div className="flex items-center justify-center text-white transition-transform group-hover:scale-105">
                <MultivrsMark className="size-7 text-white" />
              </div>
              <span className="font-clash text-[17px] font-bold tracking-wider text-white">
                MULTIVRS
              </span>
              <span className="px-2.5 py-0.5 rounded-md border border-zinc-700/80 bg-zinc-800/90 text-zinc-300 text-[11px] font-mono font-semibold tracking-wider uppercase">
                DOCS
              </span>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-1.5 -mr-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/60"
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
            <nav className="hidden md:flex items-center gap-6 text-[13.5px] text-zinc-400 font-medium shrink-0">
              <Link
                href="/docs"
                className="hover:text-white transition-colors"
              >
                Directory
              </Link>
              <Link
                href="/docs/swift-rust"
                className="hover:text-white transition-colors flex items-center gap-1.5 font-semibold text-purple-300"
              >
                <span>swift-rust</span>
                <span className="text-xs">🦀</span>
              </Link>
              <Link
                href="/docs/api"
                className="hover:text-white transition-colors"
              >
                API
              </Link>
              <Link
                href="/docs/products/client"
                className="hover:text-white transition-colors"
              >
                SDKs
              </Link>
              <Link
                href="/docs/changelog"
                className="hover:text-white transition-colors"
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
                className="flex items-center gap-3 px-3.5 py-2 rounded-lg bg-[#141416] hover:bg-[#1a1a1e] border border-zinc-800 hover:border-zinc-700 text-zinc-400 text-sm transition-all cursor-pointer shadow-sm group"
              >
                <Search className="size-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                <span className="text-zinc-400 text-sm font-normal">Search</span>
                <div className="flex items-center gap-1 ml-2">
                  <kbd className="px-1.5 py-0.5 rounded bg-zinc-800/90 border border-zinc-700/80 text-[11px] font-mono text-zinc-400">
                    ⌘
                  </kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-zinc-800/90 border border-zinc-700/80 text-[11px] font-mono text-zinc-400">
                    K
                  </kbd>
                </div>
              </button>

              {/* Notification / Changelog Bell Icon */}
              <Link
                href="/docs/changelog"
                className="size-9 rounded-lg hover:bg-zinc-800/60 flex items-center justify-center text-zinc-400 hover:text-white transition-colors hidden sm:flex"
                title="Changelog & Updates"
              >
                <Bell className="size-4.5" />
              </Link>

              {/* Theme Toggle Component */}
              <div className="flex items-center">
                <ThemeToggle />
              </div>

              {/* Vertical Divider */}
              <div className="h-5 w-px bg-zinc-800 hidden sm:block mx-1" />

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
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-xl rounded-xl border border-zinc-800 bg-[#0e0e12] shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-800 bg-[#141418]">
              <Search className="size-4.5 text-zinc-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documentation, swift-rust, CLI, APIs..."
                className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-96 overflow-y-auto p-2 flex flex-col gap-1">
              {searchResults.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500">
                  No matching documentation pages found for &quot;{searchQuery}&quot;
                </div>
              ) : (
                searchResults.map((item, idx) => (
                  <button
                    key={`${item.href}-${idx}`}
                    type="button"
                    onClick={() => handleSelectResult(item.href)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-left hover:bg-zinc-800/60 transition-colors group cursor-pointer"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-white group-hover:text-purple-300 transition-colors">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-zinc-500 line-clamp-1">
                        {item.summary || item.category}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-500 shrink-0">
                      {item.category}
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Footer with Hotkeys */}
            <div className="px-4 py-2 border-t border-zinc-800/80 bg-[#121216] flex items-center justify-between text-xs text-zinc-500 font-mono">
              <span>Select with click or Enter</span>
              <span>ESC to close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
