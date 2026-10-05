/**
 * Canonical Site Configuration & URL Resolution Helper
 * Single source of truth for site URLs, metadata, and brand constants.
 */

export function getSiteUrl(): string {
  // 1. Explicitly configured public site URL (Recommended on Vercel)
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }

  // 2. Vercel platform-provided environment variables (fallback during preview/build)
  const vercelProdUrl = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProdUrl) {
    return `https://${vercelProdUrl.replace(/\/+$/, "")}`;
  }

  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL?.trim();
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/\/+$/, "")}`;
  }

  // 3. Current production Vercel deployment domain default
  return "https://content-platform-web-kappa.vercel.app";
}

/**
 * Startup / build-time host validation guard
 */
export function validateSiteUrlConfig(): void {
  if (process.env.NODE_ENV === "production") {
    const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const vercelHost =
      process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ||
      process.env.NEXT_PUBLIC_VERCEL_URL;

    if (configuredUrl && vercelHost) {
      try {
        const configuredHost = new URL(configuredUrl).hostname;
        if (configuredHost !== vercelHost && !configuredHost.includes(vercelHost)) {
          console.warn(
            `[SiteConfig Warning] Configured NEXT_PUBLIC_SITE_URL (${configuredHost}) differs from deployment host (${vercelHost}). Ensure canonical URLs point to the intended custom domain or deployment URL.`
          );
        }
      } catch {
        console.warn(`[SiteConfig Warning] Invalid NEXT_PUBLIC_SITE_URL: "${configuredUrl}"`);
      }
    }
  }
}

export const SITE_CONFIG = {
  name: "Chronicle",
  tagline: "Technical writing you can trust — and learn from",
  description:
    "An open engineering publication platform featuring verified reviews, interactive comprehension checks, and deep technical writing.",
  url: getSiteUrl(),
  ogImageAlt: "Chronicle — Technical writing you can trust — and learn from",
  aiProvider: "Google Gemini",
  // Optional twitter handle; omitted from meta tags when undefined/empty
  twitterHandle: undefined as string | undefined,
} as const;
