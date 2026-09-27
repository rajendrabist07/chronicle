"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { fetchPosts } from "../lib/posts";
import { getAccessToken } from "../lib/auth";
import type { Post } from "../types";
import Link from "next/link";

export default function PostsPage() {
  const router = useRouter();
  const { isLoading: authLoading } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return; // AuthContext ले पहिले load हुने कुर्नुहोस्

    const token = getAccessToken();
    if (!token) {
      router.push("/login");
      return;
    }

    fetchPosts(token)
      .then((res) => setPosts(res.data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load posts"),
      )
      .finally(() => setIsLoading(false));
  }, [authLoading, router]);

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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
        <Link
          href="/posts/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-500">No posts yet.</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li key={post.id} className="rounded-lg border border-gray-200 p-4">
              <Link
                href={`/posts/${post.id}`}
                className="text-lg font-semibold text-blue-600 hover:underline"
              >
                {post.title}
              </Link>
              <p className="mt-1 text-sm text-gray-500">
                {post.status} · {new Date(post.createdAt).toLocaleDateString()}
              </p>
              <p className="mt-2 text-gray-700 line-clamp-2">{post.content}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
