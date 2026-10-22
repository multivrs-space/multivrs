"use client";

import { AlignLeft } from "lucide-react";
import { useEffect, useState } from "react";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface DocsTOCProps {
  headings?: TOCItem[];
  docId?: string;
}

export function DocsTOC({ headings = [] }: DocsTOCProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0% -60% 0%" },
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (!headings || headings.length === 0) {
    return null;
  }

  return (
    <nav className="w-56 shrink-0 hidden xl:flex flex-col gap-3 sticky top-20 self-start p-4 text-xs select-none">
      <div className="flex items-center gap-2 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
        <AlignLeft className="size-3.5" />
        <span>On this page</span>
      </div>

      <ul className="flex flex-col gap-2 border-l border-border pl-3">
        {headings.map((item) => (
          <li key={item.id} className={item.level === 3 ? "pl-2" : ""}>
            <a
              href={`#${item.id}`}
              className={`block transition-colors line-clamp-1 ${
                activeId === item.id
                  ? "text-purple-400 font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
