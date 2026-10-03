export const SITE_CONFIG = {
  name: "Chronicle",
  tagline: "The modern publishing platform with AI writing assistance",
  description:
    "A production-grade content platform with posts, threaded discussions, tags, JWT auth, and Gemini-powered AI writing tools.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://content-platform-web.vercel.app",
  ogImageAlt: "Chronicle — Modern Content & Publishing Platform",
  twitterHandle: "@chronicle",
} as const;
