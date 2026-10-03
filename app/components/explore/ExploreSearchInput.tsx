"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";

interface ExploreSearchInputProps {
  initialQuery?: string;
  activeTag?: string;
  activeSort?: string;
}

export default function ExploreSearchInput({
  initialQuery = "",
  activeTag = "",
  activeSort = "recent",
}: ExploreSearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  // Sync state if URL query changes externally
  useEffect(() => {
    const currentQ = searchParams.get("q") || "";
    setQuery(currentQ);
  }, [searchParams]);

  // Debounced search-as-you-type
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentQ = searchParams.get("q") || "";
      if (query === currentQ) return;

      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) {
        params.set("q", query.trim());
      } else {
        params.delete("q");
      }
      params.delete("page"); // reset to page 1 on new query

      startTransition(() => {
        const qs = params.toString();
        router.replace(`/explore${qs ? `?${qs}` : ""}`, { scroll: false });
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchParams, router]);

  function handleClear() {
    setQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("page");
    startTransition(() => {
      const qs = params.toString();
      router.replace(`/explore${qs ? `?${qs}` : ""}`, { scroll: false });
    });
  }

  return (
    <form
      method="get"
      action="/explore"
      onSubmit={(e) => {
        e.preventDefault();
      }}
      className="relative flex w-full max-w-md items-center"
    >
      <input
        type="text"
        name="q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search articles, topics, or authors..."
        className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-10 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
      />
      <div className="absolute left-3 text-slate-400">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        ) : (
          <Search className="h-4 w-4" aria-hidden="true" />
        )}
      </div>

      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 rounded p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          aria-label="Clear search query"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {activeTag && <input type="hidden" name="tag" value={activeTag} />}
      {activeSort && <input type="hidden" name="sort" value={activeSort} />}
    </form>
  );
}
