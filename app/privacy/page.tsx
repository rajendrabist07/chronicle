import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "../lib/site";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy and data practices for ${SITE_CONFIG.name}.`,
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Home</span>
      </Link>

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Last updated: October 2026
          </p>
        </div>
      </div>

      <div className="prose prose-slate max-w-none dark:prose-invert prose-headings:font-bold text-slate-700 dark:text-slate-300 leading-relaxed space-y-6">
        <section>
          <h2>1. Overview</h2>
          <p>
            At {SITE_CONFIG.name}, we believe in transparency, privacy, and protecting your data.
            This Privacy Policy explains how information about you is collected, used, and safeguarded when
            you interact with our publishing platform.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <p>We only collect information necessary to provide you with a reliable and personalized platform experience:</p>
          <ul>
            <li><strong>Account Information:</strong> Name, email address, and authentication credentials when you register.</li>
            <li><strong>Content:</strong> Stories, articles, drafts, tags, and comments you publish.</li>
            <li><strong>Usage Data:</strong> Reading preferences, bookmarks, and interactions to personalize your explore feed.</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Information</h2>
          <p>Your information is used exclusively to:</p>
          <ul>
            <li>Authenticate your account and maintain session security.</li>
            <li>Deliver real-time notifications regarding engagement on your published stories.</li>
            <li>Power AI writing assistance features on demand (such as generating summaries and topic suggestions).</li>
            <li>Ensure platform security and prevent unauthorized access.</li>
          </ul>
        </section>

        <section>
          <h2>4. Data Storage & Security</h2>
          <p>
            We implement enterprise security standards including HTTP Strict Transport Security (HSTS),
            strict Content Security Headers, and token-based authenticated endpoints to protect your information.
          </p>
        </section>

        <section>
          <h2>5. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or your data, reach out via our GitHub repository or contact team@{SITE_CONFIG.url.replace(/^https?:\/\//, "")}.
          </p>
        </section>
      </div>
    </main>
  );
}
