import type { Post, PaginatedResponse, ApiSuccessResponse } from "../types";
import type { Comment } from "./comments";
import type { QuizQuestion } from "../components/reading/ComprehensionQuiz";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://content-platform-e3tj.onrender.com/api/v1";

export const PUBLIC_FETCH_TIMEOUT_MS = 10000; // 10s timeout to prevent hung renders

export class PublicApiError extends Error {
  public status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.name = "PublicApiError";
    this.status = status;
  }
}

export interface PublicUser {
  id: string;
  name: string;
  username?: string | null;
  bio?: string | null;
  createdAt: string;
  badges?: string[];
  role?: string;
  avatarUrl?: string | null;
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

/**
 * Executes a resilient server-side fetch with timeout and safe JSON handling.
 * Throws PublicApiError on non-2xx so Next.js does not cache failed responses.
 */
async function publicFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: T | null }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PUBLIC_FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Accept": "application/json",
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    if (res.status === 404) {
      return { ok: false, status: 404, data: null };
    }

    // Try to safely parse response body
    let json: any = null;
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        json = await res.json();
      } catch {
        json = null;
      }
    }

    if (!res.ok) {
      const message =
        json?.message ||
        `Server returned HTTP ${res.status} (${res.statusText || "Error"})`;
      throw new PublicApiError(message, res.status);
    }

    return { ok: true, status: res.status, data: json as T };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err instanceof PublicApiError) {
      throw err;
    }
    if (err?.name === "AbortError") {
      throw new PublicApiError("Request timed out while waiting for server response", 504);
    }
    throw new PublicApiError(
      err?.message || "Failed to communicate with public API",
      503
    );
  }
}

export async function getPublicPosts(
  params: PublicPostQueryParams = {}
): Promise<PaginatedResponse<Post>> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", params.page.toString());
  if (params.limit) query.set("limit", params.limit.toString());
  if (params.q) query.set("q", params.q);
  if (params.tag) query.set("tag", params.tag);
  if (params.sort) query.set("sort", params.sort);

  const qs = query.toString();
  const endpoint = `/public/posts${qs ? `?${qs}` : ""}`;

  const res = await publicFetch<PaginatedResponse<Post>>(endpoint, {
    next: { revalidate: 60 },
  });

  if (res.status === 404 || !res.data) {
    return {
      success: true,
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    };
  }

  return res.data;
}

export async function getPublicPostBySlug(slug: string): Promise<Post | null> {
  const res = await publicFetch<ApiSuccessResponse<Post>>(
    `/public/posts/${encodeURIComponent(slug)}`,
    {
      next: { revalidate: 60 },
    }
  );

  if (res.status === 404 || !res.data) {
    return null;
  }

  return res.data.data;
}

export async function getPublicPostComments(slug: string): Promise<Comment[]> {
  const res = await publicFetch<ApiSuccessResponse<Comment[]>>(
    `/public/posts/${encodeURIComponent(slug)}/comments`,
    {
      next: { revalidate: 60 },
    }
  );

  if (res.status === 404 || !res.data) {
    return [];
  }

  return res.data.data || [];
}

export async function getPublicTags(): Promise<PublicTag[]> {
  const res = await publicFetch<ApiSuccessResponse<PublicTag[]>>("/public/tags", {
    next: { revalidate: 300 },
  });

  if (res.status === 404 || !res.data) {
    return [];
  }

  return res.data.data || [];
}

export async function getTrendingTags(limit = 6): Promise<PublicTag[]> {
  const res = await publicFetch<ApiSuccessResponse<PublicTag[]>>(
    `/public/tags/trending?limit=${limit}`,
    {
      next: { revalidate: 300 },
    }
  );

  if (res.status === 404 || !res.data) {
    return [];
  }

  return res.data.data || [];
}

export async function getPublicUser(id: string): Promise<PublicUser | null> {
  const res = await publicFetch<ApiSuccessResponse<PublicUser>>(
    `/public/users/${encodeURIComponent(id)}`,
    {
      next: { revalidate: 60 },
    }
  );

  if (res.status === 404 || !res.data) {
    return null;
  }

  return res.data.data;
}

export async function getPublicAuthor(identifier: string): Promise<PublicUser | null> {
  const res = await publicFetch<ApiSuccessResponse<PublicUser>>(
    `/public/authors/${encodeURIComponent(identifier)}`,
    {
      next: { revalidate: 60 },
    }
  );

  if (res.status === 404 || !res.data) {
    // Graceful fallback to user endpoint
    return getPublicUser(identifier);
  }

  return res.data.data;
}

export async function getPublicSitemap(): Promise<
  { slug: string; updatedAt: string }[]
> {
  const res = await publicFetch<
    ApiSuccessResponse<{ slug: string; updatedAt: string }[]>
  >("/public/sitemap", {
    next: { revalidate: 3600 },
  });

  if (res.status === 404 || !res.data) {
    return [];
  }

  return res.data.data || [];
}

export interface PostQuiz {
  id?: string;
  postId?: string;
  questions: QuizQuestion[];
}

export async function getPublicPostQuiz(slug: string): Promise<PostQuiz | null> {
  const res = await publicFetch<ApiSuccessResponse<PostQuiz>>(
    `/public/posts/${encodeURIComponent(slug)}/quiz`,
    {
      next: { revalidate: 60 },
    }
  );

  if (res.status === 404 || !res.data) {
    return null;
  }

  return res.data.data;
}

export interface AskArticleResponse {
  answer: string;
  citation?: string;
  passage?: string;
  confidence?: string;
}

export async function askArticleQuestion(
  slug: string,
  question: string
): Promise<AskArticleResponse | null> {
  const res = await publicFetch<ApiSuccessResponse<AskArticleResponse>>(
    `/public/posts/${encodeURIComponent(slug)}/ask`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    }
  );

  if (res.status === 404 || !res.data) {
    return null;
  }

  return res.data.data;
}

export interface PlatformTransparencyData {
  totalPosts: number;
  publishedPosts: number;
  authorsCount: number;
  groundedRatio?: number;
  reviewStats?: {
    approved: number;
    pending: number;
    rejected: number;
  };
}

export async function getPlatformTransparency(): Promise<PlatformTransparencyData | null> {
  const res = await publicFetch<ApiSuccessResponse<PlatformTransparencyData>>(
    "/public/transparency",
    {
      next: { revalidate: 300 },
    }
  );

  if (!res.ok || !res.data) {
    return null;
  }

  return res.data.data;
}

export interface PlatformStatusData {
  status: "operational" | "degraded" | "maintenance";
  services?: Record<string, string>;
  timestamp?: string;
}

export async function getPlatformStatus(): Promise<PlatformStatusData | null> {
  const res = await publicFetch<ApiSuccessResponse<PlatformStatusData>>(
    "/public/status",
    {
      next: { revalidate: 60 },
    }
  );

  if (!res.ok || !res.data) {
    return null;
  }

  return res.data.data;
}

/**
 * Calculates estimated reading time for a text block (average 200 wpm).
 */
export function calculateReadingTime(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}
