import type { Metadata } from "next";
import Link from "next/link";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { TrustLevelBadge, ReviewStatusBadge } from "../components/trust/TrustBadge";
import {
  ShieldCheck,
  CheckCircle2,
  Award,
  BookOpen,
  Terminal,
  BrainCircuit,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Trust Standards",
  description:
    "Explore Chronicle's verification tiers, peer review standards, and grounded technical writing principles.",
};

export default function TrustStandardsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/70 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/50 dark:text-blue-300 mb-4">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Integrity & Verification Framework</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
          Trust Standards on Chronicle
        </h1>
        <p className="mt-4 text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Technical publishing you can rely on. Our verification tiers and peer review processes ensure engineering insights are grounded, reproducible, and authoritative.
        </p>
      </div>

      {/* The Three Tiers of Trust */}
      <section className="mb-16">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          Author Verification Tiers
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Tier 1 */}
          <Card className="p-6 border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <TrustLevelBadge level="contributor" size="md" />
                <span className="text-xs font-mono text-slate-400">Tier 1</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Community Contributor
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Available to all engineers who join Chronicle. Requires confirmed email verification and compliant markdown formatting.
              </p>
            </div>
            <div className="border-t border-slate-100 pt-3 dark:border-slate-800/80 text-[11px] text-slate-500 space-y-1">
              <div>✓ Email identity verified</div>
              <div>✓ Automated anti-spam shielding</div>
              <div>✓ Standard markdown formatting</div>
            </div>
          </Card>

          {/* Tier 2 */}
          <Card className="p-6 border-blue-200 bg-blue-50/20 dark:border-blue-900/60 dark:bg-blue-950/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <TrustLevelBadge level="verified" size="md" />
                <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-semibold">Tier 2</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Verified Engineer
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Awarded to engineers with a proven publication record and demonstrated domain knowledge. Requires peer-reviewed technical articles and reproducible code samples.
              </p>
            </div>
            <div className="border-t border-blue-100 pt-3 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300 space-y-1 font-medium">
              <div>✓ Technical identity confirmed</div>
              <div>✓ Syntax-checked code blocks</div>
              <div>✓ Community peer reviews passed</div>
            </div>
          </Card>

          {/* Tier 3 */}
          <Card className="p-6 border-purple-200 bg-purple-50/20 dark:border-purple-900/60 dark:bg-purple-950/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <TrustLevelBadge level="authority" size="md" />
                <span className="text-xs font-mono text-purple-600 dark:text-purple-400 font-semibold">Tier 3</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Domain Authority
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Recognized architects and leaders in distributed systems, security, database internals, and performance engineering with a track record of high-signal writing.
              </p>
            </div>
            <div className="border-t border-purple-100 pt-3 dark:border-purple-900/40 text-[11px] text-purple-800 dark:text-purple-300 space-y-1 font-medium">
              <div>✓ Recognized subject matter expert</div>
              <div>✓ Transparent editorial revision history</div>
              <div>✓ Core platform contributor status</div>
            </div>
          </Card>
        </div>
      </section>

      {/* Review Badges & Grounding Principles */}
      <section className="mb-16">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          Article Review Signals
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <ReviewStatusBadge badge="comprehension_ready" size="sm" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Comprehension Check Ready
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Indicates the article includes verified active-recall comprehension questions with verbatim citation quotes from the text. Readers can test their understanding immediately after reading.
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <BrainCircuit className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Passage-Grounded Q&A
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              When readers use &ldquo;Ask This Article&rdquo;, answers cite exact verbatim sentences from the author&apos;s writing. We do not invent speculative answers outside the article&apos;s scope.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-800 dark:bg-slate-900/60">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Ready to publish high-signal technical writing?
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
          Join verified engineers sharing architecture breakdowns, performance post-mortems, and code patterns on Chronicle.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/register">
            <Button size="sm">Create an Account</Button>
          </Link>
          <Link href="/explore">
            <Button variant="secondary" size="sm">Explore Articles</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
