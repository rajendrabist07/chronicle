import type { MetadataRoute } from "next";
import { getSiteUrl } from "./lib/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

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
