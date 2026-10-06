"use client";

import { useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { askArticleQuestion, type AskArticleResponse } from "../../lib/public";
import { Search, Quote, Sparkles, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

interface AskThisArticleProps {
  content: string;
  slug?: string;
  className?: string;
  onHighlightPassage?: (passage: string) => void;
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

export default function AskThisArticle({
  content,
  slug,
  className = "",
  onHighlightPassage,
}: AskThisArticleProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [aiAnswer, setAiAnswer] = useState<AskArticleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    setAiAnswer(null);

    // Try backend AI grounding if slug is available
    if (slug) {
      try {
        const resp = await askArticleQuestion(slug, query);
        if (resp && resp.answer) {
          setAiAnswer(resp);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Backend ask endpoint fallback to local parser:", err);
      }
    }

    // Client-side fallback to verbatim passage matching
    const found = findGroundedQuotes(content, query);
    setResults(found);
    setIsLoading(false);
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
        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
          Passage Search
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
        <Button type="submit" size="sm" disabled={isLoading} className="h-8 shrink-0">
          {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Find Quote"}
        </Button>
      </form>
      <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
        Answers cite passages from this article. AI can make mistakes — always verify the quote.
      </p>

      {hasSearched && (
        <div className="mt-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-slate-50 p-4 text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span>Grounding question in article passages...</span>
            </div>
          ) : aiAnswer ? (
            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs dark:border-blue-900/60 dark:bg-blue-950/40">
              <div className="flex items-center gap-1.5 font-semibold text-blue-900 dark:text-blue-200 mb-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Answer from Article:</span>
              </div>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed mb-3">
                {aiAnswer.answer}
              </p>
              {(aiAnswer.citation || aiAnswer.passage) && (
                <div className="rounded-lg bg-white/90 p-2.5 dark:bg-slate-900/90 border border-blue-100 dark:border-blue-900/40">
                  <div className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                    <Quote className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Passage Citation: </span>
                      <span className="italic">&ldquo;{aiAnswer.citation || aiAnswer.passage}&rdquo;</span>
                    </div>
                  </div>
                  {onHighlightPassage && (
                    <button
                      type="button"
                      onClick={() => onHighlightPassage(aiAnswer.citation || aiAnswer.passage || "")}
                      className="mt-2 text-[11px] font-semibold text-blue-600 hover:underline dark:text-blue-400 flex items-center gap-1"
                    >
                      <span>Highlight Passage in Article</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : results.length === 0 ? (
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
                  <div className="flex-1">
                    <p className="font-semibold text-[11px] text-blue-700 dark:text-blue-400 mb-1">
                      Verbatim Grounded Citation:
                    </p>
                    <p className="leading-relaxed italic">&quot;{res.matchedSentence}&quot;</p>
                    {onHighlightPassage && (
                      <button
                        type="button"
                        onClick={() => onHighlightPassage(res.matchedSentence)}
                        className="mt-2 text-[11px] font-semibold text-blue-600 hover:underline dark:text-blue-400 flex items-center gap-1"
                      >
                        <span>Highlight in Article</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
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
