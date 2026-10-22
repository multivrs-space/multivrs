"use client";

import {
  BarChart2,
  Bot,
  Box,
  Calendar,
  ChevronRight,
  Clock,
  Code2,
  Cpu,
  CreditCard,
  Database,
  Flame,
  GitFork,
  Globe,
  Image as ImageIcon,
  Inbox,
  KeyRound,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  LucideIcon,
  Mail,
  MailCheck,
  Mails,
  Package,
  Rocket,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Tags,
  Terminal,
  Users,
  Webhook,
  Workflow,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { MultivrsMark } from "@/components/brand/Logo";
import type { DocCategory, DocsBadge } from "../types";

const ICON_MAP: Record<string, LucideIcon> = {
  // PascalCase
  BarChart2,
  Bot,
  Box,
  Calendar,
  Clock,
  Code2,
  Cpu,
  CreditCard,
  Database,
  Flame,
  GitFork,
  Globe,
  Image: ImageIcon,
  Inbox,
  KeyRound,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  Mail,
  MailCheck,
  Mails,
  Package,
  Rocket,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Tags,
  Terminal,
  Users,
  Webhook,
  Workflow,
  Zap,
  // kebab-case and lowercase aliases
  "bar-chart-2": BarChart2,
  barchart2: BarChart2,
  bot: Bot,
  box: Box,
  calendar: Calendar,
  clock: Clock,
  code: Code2,
  "code-2": Code2,
  code2: Code2,
  cpu: Cpu,
  "credit-card": CreditCard,
  creditcard: CreditCard,
  database: Database,
  flame: Flame,
  "git-fork": GitFork,
  gitfork: GitFork,
  globe: Globe,
  image: ImageIcon,
  inbox: Inbox,
  "key-round": KeyRound,
  keyround: KeyRound,
  layers: Layers,
  "layout-dashboard": LayoutDashboard,
  layoutdashboard: LayoutDashboard,
  "layout-grid": LayoutGrid,
  layoutgrid: LayoutGrid,
  mail: Mail,
  "mail-check": MailCheck,
  mailcheck: MailCheck,
  mails: Mails,
  package: Package,
  rocket: Rocket,
  search: Search,
  send: Send,
  "shield-alert": ShieldAlert,
  shieldalert: ShieldAlert,
  "shield-check": ShieldCheck,
  shieldcheck: ShieldCheck,
  sparkles: Sparkles,
  tags: Tags,
  terminal: Terminal,
  users: Users,
  webhook: Webhook,
  workflow: Workflow,
  zap: Zap,
};

interface DocsSidebarProps {
  categories: DocCategory[];
  currentFramework?: string;
  onFrameworkChange?: (framework: string) => void;
  showMobileHeader?: boolean;
}

export function DocsSidebar({ categories, showMobileHeader = false }: DocsSidebarProps) {
  const pathname = usePathname();
  const [filterText, setFilterText] = useState("");
  // All accordion items are closed by default
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Press '/' to focus filter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  // Filter categories and items dynamically
  const filteredCategories = useMemo(() => {
    if (!filterText.trim()) return categories;
    const q = filterText.toLowerCase();

    return categories
      .map((cat) => {
        const matchesCategory = cat.title.toLowerCase().includes(q);
        const matchingItems = cat.items.filter((item) => {
          const itemMatch =
            item.title.toLowerCase().includes(q) ||
            item.slug.toLowerCase().includes(q) ||
            item.summary?.toLowerCase().includes(q);
          const childMatch = item.children?.some(
            (c) =>
              c.title.toLowerCase().includes(q) ||
              c.slug.toLowerCase().includes(q)
          );
          return itemMatch || childMatch;
        });

        if (matchesCategory) return cat;
        return { ...cat, items: matchingItems };
      })
      .filter((cat) => cat.items.length > 0);
  }, [categories, filterText]);

  // Only render badge if it's "Coming soon", fully rounded
  const renderBadge = (badge?: DocsBadge) => {
    if (!badge || (badge !== "Coming soon" && badge !== ("Soon" as any))) return null;
    return (
      <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/60 shrink-0">
        Coming soon
      </span>
    );
  };

  const isItemActive = (href: string) => {
    if (href === "/docs") {
      return pathname === "/docs" || pathname === "/docs/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="w-72 lg:w-80 xl:w-[320px] shrink-0 border-r border-zinc-800/80 bg-[#0a0a0c] h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto px-4 py-4 flex flex-col select-none scrollbar-thin">
      {/* Mobile-only header lockup */}
      {showMobileHeader && (
        <div className="flex items-center gap-3 pb-4 mb-3 border-b border-zinc-800">
          <div className="flex items-center justify-center text-white">
            <MultivrsMark className="size-7 text-white" />
          </div>
          <span className="font-clash text-lg font-bold tracking-wider text-white">
            MULTIVRS
          </span>
          <span className="px-2.5 py-0.5 rounded-md border border-zinc-700/80 bg-zinc-800/90 text-zinc-300 text-[11px] font-mono font-semibold tracking-wider">
            DOCS
          </span>
        </div>
      )}

      {/* Cloudflare-style "Filter sidebar /" search input */}
      <div className="relative mb-4">
        <input
          ref={inputRef}
          type="text"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Filter sidebar"
          className="w-full bg-[#141416] text-white placeholder-zinc-500 text-sm rounded-lg pl-3.5 pr-9 py-2.5 border border-zinc-800 focus:outline-none focus:border-zinc-700 transition-colors"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none rounded bg-[#202024] border border-zinc-700/60 text-zinc-400 font-mono text-[11px] px-2 py-0.5 leading-none">
          /
        </div>
      </div>

      {/* Sections and Navigation items */}
      <div className="flex flex-col gap-6 pb-12">
        {filteredCategories.map((category) => (
          <div key={category.id} className="flex flex-col gap-1">
            {/* Section Header: grouping with opacity as requested */}
            <div className="px-3 pt-3 pb-1.5 text-xs font-bold tracking-wider text-zinc-500 uppercase">
              {category.title}
            </div>

            {/* Section Items: pure text-white, no opacity */}
            <div className="flex flex-col gap-0.5">
              {category.items.map((item) => {
                const hasChildren = Boolean(item.children && item.children.length > 0);
                const isExpanded = expandedItems[item.id] ?? false;
                const active = !hasChildren && isItemActive(item.href);
                const hasActiveChild = hasChildren && item.children?.some((c) => isItemActive(c.href));
                const IconComponent = item.icon
                  ? ICON_MAP[item.icon] || ICON_MAP[item.icon.toLowerCase()]
                  : null;

                return (
                  <div key={item.id} className="flex flex-col">
                    {hasChildren ? (
                      /* Accordion Item: Clicking ONLY toggles open/close. Does NOT navigate to a page! */
                      <button
                        type="button"
                        onClick={() => toggleExpand(item.id)}
                        className={`group w-full flex items-center justify-between rounded-md px-3 py-2 text-[13.5px] transition-colors cursor-pointer text-left ${
                          hasActiveChild || isExpanded
                            ? "bg-[#18181b] text-white font-medium"
                            : "text-white hover:bg-[#18181b]"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {item.prefix && (
                            <span className="font-mono font-bold text-white text-sm shrink-0">
                              {item.prefix}
                            </span>
                          )}

                          {IconComponent && !item.prefix && (
                            <IconComponent className="size-4 shrink-0 text-white" />
                          )}

                          {/* Pure text-white with zero opacity */}
                          <span className="truncate text-white font-medium">{item.title}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {item.badge && renderBadge(item.badge)}
                          <ChevronRight
                            className={`size-4 text-zinc-400 group-hover:text-white transition-transform duration-150 ${
                              isExpanded ? "rotate-90 text-white" : ""
                            }`}
                          />
                        </div>
                      </button>
                    ) : (
                      /* Direct Leaf Link: item has no children, so clicking it navigates to the page */
                      <Link
                        href={item.href}
                        className={`group flex items-center justify-between rounded-md px-3 py-2 text-[13.5px] transition-colors ${
                          active
                            ? "bg-[#242424] text-white font-semibold shadow-sm"
                            : "text-white hover:bg-[#18181b]"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {item.prefix && (
                            <span className="font-mono font-bold text-white text-sm shrink-0">
                              {item.prefix}
                            </span>
                          )}

                          {IconComponent && !item.prefix && (
                            <IconComponent className="size-4 shrink-0 text-white" />
                          )}

                          <span className="truncate text-white font-medium">{item.title}</span>
                        </div>

                        {item.badge && renderBadge(item.badge)}
                      </Link>
                    )}

                    {/* Expandable sub-items: The opened list contains the navigable links */}
                    {hasChildren && isExpanded && (
                      <div className="flex flex-col gap-0.5 pl-7 pr-1 pt-1.5 pb-1 border-l border-zinc-800/80 ml-5 my-1">
                        {item.children?.map((child) => {
                          const childActive = isItemActive(child.href);
                          return (
                            <Link
                              key={child.id}
                              href={child.href}
                              className={`flex items-center justify-between rounded px-2.5 py-1.5 text-xs transition-colors ${
                                childActive
                                  ? "bg-[#242424] text-white font-semibold"
                                  : "text-white hover:bg-[#18181b]"
                              }`}
                            >
                              <span className="truncate text-white font-normal">{child.title}</span>
                              {child.badge && renderBadge(child.badge)}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
