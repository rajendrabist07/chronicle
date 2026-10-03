import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "./lib/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = SITE_CONFIG.url;

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/explore", "/read/", "/tags/", "/u/", "/privacy", "/terms"],
        disallow: [
          "/posts",
          "/posts/*",
          "/login",
          "/register",
          "/settings",
          "/notifications",
          "/bookmarks",
          "/design-system",
          "/verify-email",
          "/forgot-password",
          "/reset-password",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
