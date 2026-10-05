"use client";

import { useState } from "react";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { Search, Quote, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

interface AskThisArticleProps {
  content: string;
  className?: string;
}

interface SearchResult {
  paragraph: string;
  matchedSentence: string;
}

export function findGroundedQuotes(content: string, query: string): SearchResult[] {
  if (!query.trim() || query.length < 3) return [];

  const cleanText = content.replace(/[#*`_~]/g, "");
  const paragraphs = cleanText.split(/\n\s*\n/).filter((p) => p.trim().length > 20);
  const keywords = query.toLowerCase().split(/\s+/).filter((k) => k.length > 2);

  const results: SearchResult[] = [];

  for (const para of paragraphs) {
    const paraLower = para.toLowerCase();
    const matchesKeyword = keywords.some((k) => paraLower.includes(k));

    if (matchesKeyword) {
      const sentences = para.split(/(?<=[.?!])\s+/);
      const matched =
        sentences.find((s) => keywords.some((k) => s.toLowerCase().includes(k))) ||
        sentences[0];

      results.push({
        paragraph: para.trim(),
        matchedSentence: matched.trim(),
      });

      if (results.length >= 3) break;
    }
  }

  return results;
}

export default function AskThisArticle({ content, className = "" }: AskThisArticleProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const found = findGroundedQuotes(content, query);
    setResults(found);
    setHasSearched(true);
  };

  return (
    <Card className={`border-slate-200 p-5 dark:border-slate-800 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <Search className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Ask This Article
            </h3>
          </div>
        </div>
        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
          100% Grounded
        </span>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (hasSearched) setHasSearched(false);
          }}
          placeholder="e.g. Postgres MVCC, caching..."
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400"
          aria-label="Ask a question about this article"
        />
        <Button type="submit" size="sm" className="h-8 shrink-0">
          Find Quote
        </Button>
      </form>

      {hasSearched && (
        <div className="mt-4 space-y-3">
          {results.length === 0 ? (
            <div className="rounded-lg bg-slate-50 p-3 text-center text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              No verbatim matches found for &quot;{query}&quot;. Try broader technical keywords.
            </div>
          ) : (
            results.map((res, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-xs dark:border-blue-900/40 dark:bg-blue-950/30"
              >
                <div className="flex items-start gap-2 text-blue-950 dark:text-blue-200">
                  <Quote className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[11px] text-blue-700 dark:text-blue-400 mb-1">
                      Verbatim Grounded Citation:
                    </p>
                    <p className="leading-relaxed italic">&quot;{res.matchedSentence}&quot;</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </Card>
  );
}
