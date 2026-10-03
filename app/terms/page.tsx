import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "../lib/site";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms and Conditions of use for ${SITE_CONFIG.name}.`,
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
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
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Terms of Service
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Last updated: October 2026
          </p>
        </div>
      </div>

      <div className="prose prose-slate max-w-none dark:prose-invert prose-headings:font-bold text-slate-700 dark:text-slate-300 leading-relaxed space-y-6">
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using {SITE_CONFIG.name}, you agree to be bound by these Terms of Service and all applicable laws and regulations.
          </p>
        </section>

        <section>
          <h2>2. User Accounts & Responsibilities</h2>
          <p>
            When creating an account, you agree to provide accurate information and keep your credentials confidential. You are responsible for all activities that occur under your account.
          </p>
        </section>

        <section>
          <h2>3. Content Ownership & Community Standards</h2>
          <p>
            Authors retain ownership and copyright over the articles and comments they publish on {SITE_CONFIG.name}.
            By posting content, you grant {SITE_CONFIG.name} a non-exclusive license to display and distribute your public articles across the platform.
          </p>
          <p>
            We strictly prohibit content that contains malicious code, harassment, unauthorized advertisements, or copyright infringement.
          </p>
        </section>

        <section>
          <h2>4. AI Features & Usage</h2>
          <p>
            AI writing suggestions and assistance are provided to augment your writing. You remain solely responsible for reviewing and verifying the accuracy and appropriateness of any AI-assisted content prior to publication.
          </p>
        </section>

        <section>
          <h2>5. Termination & Modifications</h2>
          <p>
            We reserve the right to modify these Terms of Service at any time. Continued use of the platform after updates constitute acceptance of the revised terms.
          </p>
        </section>
      </div>
    </main>
  );
}
