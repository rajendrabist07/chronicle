import type { MetadataRoute } from "next";
import { getSiteUrl } from "./lib/site";
import { getPublicSitemap, getPublicTags } from "./lib/public";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  // Core static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/explore`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  try {
    const [posts, tags] = await Promise.all([
      getPublicSitemap(),
      getPublicTags(),
    ]);

    const postRoutes: MetadataRoute.Sitemap = (posts || []).map((post) => ({
      url: `${siteUrl}/read/${post.slug}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const tagRoutes: MetadataRoute.Sitemap = (tags || []).map((tag) => ({
      url: `${siteUrl}/tags/${encodeURIComponent(tag.name)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    return [...staticRoutes, ...postRoutes, ...tagRoutes];
  } catch {
    return staticRoutes;
  }
}
