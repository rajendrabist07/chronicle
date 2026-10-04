"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import RequireAuth from "../components/auth/RequireAuth";
import { getAccessToken } from "../lib/auth";
import { fetchBookmarkedPosts, toggleBookmark } from "../lib/posts";
import { describeApiError } from "../lib/errors";
import type { Post } from "../types";
import { calculateReadingTime } from "../lib/public";
import { formatRelativeTime } from "../lib/time";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import Pagination from "../components/ui/Pagination";
import Skeleton from "../components/ui/Skeleton";
import { useToast } from "../components/ui/Toast";
import {
  Bookmark,
  BookmarkCheck,
  Clock,
  User,
  ArrowRight,
} from "lucide-react";

export default function BookmarksPage() {
  return (
    <RequireAuth>
      <BookmarksContent />
    </RequireAuth>
  );
}

function BookmarksContent() {
  const { info, error } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadBookmarks = useCallback(
    async (currentPage = page) => {
      const token = getAccessToken();
      if (!token) return;
      try {
        setLoading(true);
        const res = await fetchBookmarkedPosts(token, currentPage, 10);
        setPosts(res.data);
        setTotalPages(res.pagination.totalPages);
        setTotalCount(res.pagination.total);
      } catch (err: any) {
        error(describeApiError(err));
      } finally {
        setLoading(false);
      }
    },
    [page, error]
  );

  useEffect(() => {
    loadBookmarks(page);
  }, [page, loadBookmarks]);

  async function handleRemoveBookmark(postId: string) {
    const token = getAccessToken();
    if (!token) return;
    try {
      await toggleBookmark(postId, token);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      info("Bookmark removed");
    } catch (err: any) {
      error(describeApiError(err));
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          Saved Bookmarks
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Articles and stories you have saved for later reading.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="h-8 w-8 text-slate-400" />}
          title="No bookmarks saved"
          description="When you find an interesting article on Explore or reading pages, click the bookmark icon to save it here."
          action={
            <Link href="/explore">
              <Button size="sm">Explore Articles</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const readingTime = calculateReadingTime(post.content);
            return (
              <Card
                key={post.id}
                className="group relative flex flex-col justify-between p-6 transition-all hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <Link
                      href={post.slug ? `/read/${post.slug}` : `/posts/${post.id}`}
                      className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                    >
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {post.title}
                      </h2>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleRemoveBookmark(post.id)}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-slate-200 text-blue-600 hover:bg-slate-100 dark:border-slate-800 dark:text-blue-400 dark:hover:bg-slate-800"
                      title="Remove bookmark"
                    >
                      <BookmarkCheck className="h-4 w-4 fill-current" />
                    </button>
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                    {post.content.replace(/[#*`_~[\]]/g, "").slice(0, 180)}...
                  </p>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {post.tags.map((tag) => (
                        <Badge key={tag.id} variant="neutral">
                          #{tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Metadata */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4 dark:border-slate-800/60">
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      <User className="h-3.5 w-3.5" />
                      {post.authorName || "Author"}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {readingTime} min read
                    </span>
                    <span>•</span>
                    <span>{formatRelativeTime(post.createdAt)}</span>
                  </div>

                  <Link
                    href={post.slug ? `/read/${post.slug}` : `/posts/${post.id}`}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    Read article <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
}
