"use client";

import { useEffect, useState } from "react";
import { List, ChevronRight } from "lucide-react";

export interface TOCHeading {
  id: string;
  text: string;
  level: number;
}

export function extractHeadings(markdown: string): TOCHeading[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: TOCHeading[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim().replace(/[*_~`]/g, "");
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

    headings.push({ id, text, level });
  }

  return headings;
}

interface TableOfContentsProps {
  headings: TOCHeading[];
  className?: string;
}

export default function TableOfContents({ headings, className = "" }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-80px 0% -60% 0%",
        threshold: 0.1,
      }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav
      aria-label="Table of contents"
      className={`rounded-xl border border-slate-200/80 bg-white/80 p-4 backdrop-blur-xs dark:border-slate-800/80 dark:bg-slate-900/80 ${className}`}
    >
      <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
        <List className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
        <span>Table of Contents</span>
      </div>

      <ul className="space-y-1.5 text-xs">
        {headings.map((h) => {
          const isActive = activeId === h.id;
          return (
            <li
              key={h.id}
              style={{ paddingLeft: `${(h.level - 2) * 12}px` }}
              className="transition-colors"
            >
              <a
                href={`#${h.id}`}
                className={`group flex items-center py-1 transition-colors ${
                  isActive
                    ? "font-semibold text-blue-600 dark:text-blue-400"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <ChevronRight
                  className={`mr-1 h-3 w-3 shrink-0 transition-transform ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-400 opacity-0 group-hover:opacity-100"
                  }`}
                />
                <span className="line-clamp-1">{h.text}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
