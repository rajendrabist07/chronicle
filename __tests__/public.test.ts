import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  calculateReadingTime,
  getPublicPosts,
  getPublicPostBySlug,
  getPublicTags,
  getPublicUser,
  getPublicSitemap,
  PublicApiError,
} from "../app/lib/public";

describe("Public API client & helpers", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("calculateReadingTime", () => {
    it("returns 1 min read for short texts", () => {
      expect(calculateReadingTime("Hello world")).toBe("1 min read");
    });

    it("calculates accurate reading time for long texts", () => {
      const words = Array(500).fill("word").join(" ");
      expect(calculateReadingTime(words)).toBe("3 min read");
    });
  });

  describe("getPublicPosts", () => {
    it("returns parsed posts on 200 OK", async () => {
      const mockData = {
        success: true,
        data: [{ id: "1", title: "Test Post", slug: "test-post", content: "Content" }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => mockData,
      });

      const res = await getPublicPosts({ page: 1 });
      expect(res.data).toHaveLength(1);
      expect(res.data[0].title).toBe("Test Post");
    });

    it("throws PublicApiError on 500 server error", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          success: false,
          message: "The table public.post_likes does not exist in the current database.",
        }),
      });

      await expect(getPublicPosts()).rejects.toThrow(PublicApiError);
    });

    it("throws PublicApiError on non-JSON 502 proxy error", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        statusText: "Bad Gateway",
        headers: new Headers({ "content-type": "text/html" }),
        text: async () => "<html><body>502 Bad Gateway</body></html>",
      });

      await expect(getPublicPosts()).rejects.toThrow(PublicApiError);
    });

    it("throws PublicApiError on network failure", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("fetch failed"));

      await expect(getPublicPosts()).rejects.toThrow(PublicApiError);
    });
  });

  describe("getPublicPostBySlug", () => {
    it("returns null on 404 Not Found", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        headers: new Headers(),
      });

      const res = await getPublicPostBySlug("non-existent");
      expect(res).toBeNull();
    });

    it("returns post data on 200 OK", async () => {
      const mockPost = {
        id: "p1",
        title: "Deep Dive",
        slug: "deep-dive",
        content: "Awesome content",
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ success: true, data: mockPost }),
      });

      const res = await getPublicPostBySlug("deep-dive");
      expect(res?.title).toBe("Deep Dive");
    });

    it("throws PublicApiError on 500 server error instead of masking as 404", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ success: false, message: "Database failure" }),
      });

      await expect(getPublicPostBySlug("deep-dive")).rejects.toThrow(PublicApiError);
    });
  });

  describe("getPublicTags & getPublicUser & getPublicSitemap", () => {
    it("returns tags on 200 OK", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ success: true, data: [{ id: "t1", name: "typescript" }] }),
      });

      const tags = await getPublicTags();
      expect(tags).toHaveLength(1);
      expect(tags[0].name).toBe("typescript");
    });

    it("returns user on 200 OK and null on 404", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ success: true, data: { id: "u1", name: "Rajendra" } }),
      });

      const user = await getPublicUser("u1");
      expect(user?.name).toBe("Rajendra");

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers(),
      });

      const notFoundUser = await getPublicUser("u404");
      expect(notFoundUser).toBeNull();
    });

    it("returns sitemap on 200 OK", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          success: true,
          data: [{ slug: "post-1", updatedAt: "2026-01-01T00:00:00Z" }],
        }),
      });

      const sitemap = await getPublicSitemap();
      expect(sitemap).toHaveLength(1);
    });
  });
});
