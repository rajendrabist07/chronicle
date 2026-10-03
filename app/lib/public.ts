import { notFound } from "next/navigation";
import type { Post, PaginatedResponse, ApiSuccessResponse } from "../types";
import type { Comment } from "./comments";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://content-platform-e3tj.onrender.com/api/v1";

export interface PublicUser {
  id: string;
  name: string;
  bio?: string | null;
  createdAt: string;
  _count?: {
    posts: number;
    comments: number;
  };
}

export interface PublicTag {
  id: string;
  name: string;
  _count?: {
    posts: number;
  };
}

export interface PublicPostQueryParams {
  page?: number;
  limit?: number;
  q?: string;
  tag?: string;
  sort?: string;
}

export async function getPublicPosts(
  params: PublicPostQueryParams = {},
): Promise<PaginatedResponse<Post>> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", params.page.toString());
  if (params.limit) query.set("limit", params.limit.toString());
  if (params.q) query.set("q", params.q);
  if (params.tag) query.set("tag", params.tag);
  if (params.sort) query.set("sort", params.sort);

  try {
    const res = await fetch(`${API_URL}/public/posts?${query.toString()}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      if (res.status === 404) notFound();
      // Fallback response on backend cold start/unreachable
      return {
        success: true,
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
      };
    }

    return await res.json();
  } catch {
    return {
      success: true,
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    };
  }
}

export async function getPublicPostBySlug(slug: string): Promise<Post | null> {
  try {
    const res = await fetch(`${API_URL}/public/posts/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch post: ${res.status}`);
    }

    const json: ApiSuccessResponse<Post> = await res.json();
    return json.data;
  } catch (err) {
    console.error("Public post fetch error:", err);
    return null;
  }
}

export async function getPublicPostComments(slug: string): Promise<Comment[]> {
  try {
    const res = await fetch(
      `${API_URL}/public/posts/${encodeURIComponent(slug)}/comments`,
      {
        next: { revalidate: 60 },
      },
    );

    if (!res.ok) return [];
    const json: ApiSuccessResponse<Comment[]> = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function getPublicTags(): Promise<PublicTag[]> {
  try {
    const res = await fetch(`${API_URL}/public/tags`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) return [];
    const json: ApiSuccessResponse<PublicTag[]> = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function getPublicUser(id: string): Promise<PublicUser | null> {
  try {
    const res = await fetch(`${API_URL}/public/users/${encodeURIComponent(id)}`, {
      next: { revalidate: 60 },
    });

    if (res.status === 404) return null;
    if (!res.ok) return null;

    const json: ApiSuccessResponse<PublicUser> = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function getPublicSitemap(): Promise<
  { slug: string; updatedAt: string }[]
> {
  try {
    const res = await fetch(`${API_URL}/public/sitemap`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json: ApiSuccessResponse<{ slug: string; updatedAt: string }[]> =
      await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

/**
 * Calculates estimated reading time for a text block (average 200 wpm).
 */
export function calculateReadingTime(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}
