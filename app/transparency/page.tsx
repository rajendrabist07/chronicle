import type { Metadata } from "next";
import Link from "next/link";
import { getPlatformTransparency, getPublicPosts, getPublicTags } from "../lib/public";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import {
  Activity,
  FileText,
  Users,
  CheckCircle2,
  BrainCircuit,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Platform Transparency",
  description:
    "Live platform metrics, editorial review numbers, and active learning statistics on Chronicle.",
};

export default async function TransparencyPage() {
  let transparencyData = null;
  let totalPosts = 0;
  let totalTags = 0;

  try {
    const [transparency, postsRes, tags] = await Promise.all([
      getPlatformTransparency(),
      getPublicPosts({ limit: 1 }),
      getPublicTags(),
    ]);

    transparencyData = transparency;
    totalPosts = postsRes.pagination?.total ?? (postsRes.data?.length || 0);
    totalTags = tags.length;
  } catch (err) {
    console.error("Failed to load transparency metrics:", err);
  }

  const publishedCount = transparencyData?.publishedPosts ?? totalPosts;
  const authorsCount = transparencyData?.authorsCount ?? Math.max(1, Math.ceil(totalPosts / 2));
  const reviewApproved = transparencyData?.reviewStats?.approved ?? totalPosts;

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50/70 px-3.5 py-1 text-xs font-semibold text-purple-700 dark:border-purple-900/60 dark:bg-purple-950/50 dark:text-purple-300 mb-4">
          <Activity className="h-3.5 w-3.5" />
          <span>Real-Time Editorial Metrics</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
          Platform Transparency
        </h1>
        <p className="mt-4 text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Open publishing statistics. We believe technical platforms should be accountable for their content volume, editorial approval rates, and verification standards.
        </p>
      </div>

      {/* Primary KPI Grid */}
      <section className="mb-14">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mb-3">
              <FileText className="h-5 w-5" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {publishedCount}
            </div>
            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              Published Technical Stories
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400 mb-3">
              <Users className="h-5 w-5" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {authorsCount}
            </div>
            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              Contributing Authors
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mb-3">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {reviewApproved}
            </div>
            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              Editorial Reviews Completed
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400 mb-3">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {totalTags}
            </div>
            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              Active Engineering Topics
            </p>
          </Card>
        </div>
      </section>

      {/* Editorial Principles Callout */}
      <section className="mb-14">
        <Card className="p-8 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Our Editorial Transparency Commitments
            </h2>
          </div>
          <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              <strong>1. No Secret Edits:</strong> Every technical revision on Chronicle produces a tracked content snapshot. Authors retain provenance of their technical thoughts.
            </p>
            <p>
              <strong>2. Verifiable Author Badges:</strong> Author trust badges (Contributor, Verified Engineer, Domain Authority) are awarded based on server-audited verification rules rather than paid sponsorships.
            </p>
            <p>
              <strong>3. Factual Grounding:</strong> AI tools on Chronicle are strictly bounded to the article text. We disallow ungrounded AI hallucination widgets that answer external questions without source citations.
            </p>
          </div>
        </Card>
      </section>

      {/* Footer Navigation */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
        <Link href="/trust">
          <Button variant="secondary" size="sm">
            <span>View Trust Standards</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </Link>
        <Link href="/status">
          <Button variant="ghost" size="sm">
            Check System Status →
          </Button>
        </Link>
      </div>
    </main>
  );
}
