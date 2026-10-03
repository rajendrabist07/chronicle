"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { fetchPosts } from "../lib/posts";
import { getAccessToken } from "../lib/auth";
import type { Post } from "../types";
import Button from "../components/ui/Button";
import Link from "next/link";

type StatusFilter = "ALL" | "DRAFT" | "PUBLISHED";

export default function PostsPage() {
  const router = useRouter();
  const { isLoading: authLoading } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    const token = getAccessToken();
    if (!token) {
      router.push("/login");
      return;
    }

    setIsLoading(true);
    fetchPosts(
      token,
      page,
      10,
      statusFilter === "ALL" ? undefined : statusFilter,
    )
      .then((res) => {
        setPosts(res.data);
        setTotalPages(res.pagination.totalPages);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load posts"),
      )
      .finally(() => setIsLoading(false));
  }, [authLoading, router, page, statusFilter]);

  function handleFilterChange(newFilter: StatusFilter) {
    setStatusFilter(newFilter);
    setPage(1);
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-md border border-gray-200 p-1">
            <Button
              variant={statusFilter === "ALL" ? "primary" : "secondary"}
              onClick={() => handleFilterChange("ALL")}
              className="px-3 py-1 text-xs"
            >
              All
            </Button>
            <Button
              variant={statusFilter === "DRAFT" ? "primary" : "secondary"}
              onClick={() => handleFilterChange("DRAFT")}
              className="px-3 py-1 text-xs"
            >
              Draft
            </Button>
            <Button
              variant={statusFilter === "PUBLISHED" ? "primary" : "secondary"}
              onClick={() => handleFilterChange("PUBLISHED")}
              className="px-3 py-1 text-xs"
            >
              Published
            </Button>
          </div>
          <Link
            href="/posts/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + New Post
          </Link>
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-500">No posts found.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {posts.map((post) => (
              <li
                key={post.id}
                className="rounded-lg border border-gray-200 p-4"
              >
                <Link
                  href={`/posts/${post.id}`}
                  className="text-lg font-semibold text-blue-600 hover:underline"
                >
                  {post.title}
                </Link>
                <p className="mt-1 text-sm text-gray-500">
                  {post.status} ·{" "}
                  {new Date(post.createdAt).toLocaleDateString()}
                  {post.authorName && ` · by ${post.authorName}`}
                </p>
                <p className="mt-2 text-gray-700 line-clamp-2">
                  {post.content}
                </p>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
