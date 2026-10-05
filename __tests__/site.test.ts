import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getSiteUrl, validateSiteUrlConfig, SITE_CONFIG } from "../app/lib/site";

describe("Site URL and Configuration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns explicit NEXT_PUBLIC_SITE_URL without trailing slash", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com///";
    expect(getSiteUrl()).toBe("https://example.com");
  });

  it("falls back to NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL with https prefix", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL = "my-site.vercel.app/";
    expect(getSiteUrl()).toBe("https://my-site.vercel.app");
  });

  it("falls back to NEXT_PUBLIC_VERCEL_URL with https prefix", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
    process.env.NEXT_PUBLIC_VERCEL_URL = "preview-123.vercel.app";
    expect(getSiteUrl()).toBe("https://preview-123.vercel.app");
  });

  it("falls back to default production kappa deployment domain", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
    delete process.env.NEXT_PUBLIC_VERCEL_URL;
    expect(getSiteUrl()).toBe("https://content-platform-web-kappa.vercel.app");
  });

  it("validates SITE_CONFIG constants", () => {
    expect(SITE_CONFIG.name).toBe("Chronicle");
    expect(SITE_CONFIG.aiProvider).toBe("Google Gemini");
    expect(SITE_CONFIG.tagline).toContain("Technical writing you can trust");
  });

  it("logs warning on host mismatch in production", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubEnv("NODE_ENV", "production");
    process.env.NEXT_PUBLIC_SITE_URL = "https://old-domain.com";
    process.env.NEXT_PUBLIC_VERCEL_URL = "new-domain.vercel.app";

    validateSiteUrlConfig();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[SiteConfig Warning]")
    );
    warnSpy.mockRestore();
    vi.unstubAllEnvs();
  });
});
