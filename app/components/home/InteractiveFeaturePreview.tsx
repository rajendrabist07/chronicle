"use client";

import { useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { TrustLevelBadge, ReviewStatusBadge } from "../trust/TrustBadge";
import {
  Sparkles,
  ShieldCheck,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Quote,
  Search,
  BookOpen,
  ArrowRight,
  BrainCircuit,
  Lock,
} from "lucide-react";

export default function InteractiveFeaturePreview() {
  const [activeTab, setActiveTab] = useState<"comprehension" | "trust">("comprehension");
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [highlightQuote, setHighlightQuote] = useState<boolean>(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);

  const sampleArticle = {
    title: "Understanding PostgreSQL MVCC & Tuple Versioning",
    author: "Elena Rostova",
    trustLevel: "authority" as const,
    publishedAt: "2026-03-28",
    excerpt:
      "Under Multi-Version Concurrency Control (MVCC), PostgreSQL does not mutate database rows in-place during UPDATE operations. Instead, it writes a completely new physical tuple to the data page and marks the previous tuple as expired. The vacuum process eventually reclaims dead tuples to prevent table bloat.",
    highlightSnippet: "PostgreSQL does not mutate database rows in-place during UPDATE operations. Instead, it writes a completely new physical tuple to the data page",
  };

  const sampleQuestions = [
    {
      query: "How does Postgres handle updates under MVCC?",
      answer: "PostgreSQL does not mutate database rows in-place during UPDATE operations. Instead, it writes a completely new physical tuple to the data page.",
      confidence: "Verbatim Match (100% Grounded)",
    },
    {
      query: "What role does VACUUM play?",
      answer: "The vacuum process eventually reclaims dead tuples to prevent table bloat.",
      confidence: "Verbatim Match (100% Grounded)",
    },
  ];

  const quizOptions = [
    { id: 0, text: "It overwrites data in-place and stores rollback info in an undo log.", correct: false },
    { id: 1, text: "It writes a new tuple and marks the old tuple as dead for vacuuming.", correct: true },
    { id: 2, text: "It locks the entire table until the transaction commits.", correct: false },
  ];

  const handleSelectOption = (idx: number) => {
    setSelectedQuizOption(idx);
    setQuizSubmitted(true);
    setHighlightQuote(true);
  };

  const resetQuiz = () => {
    setSelectedQuizOption(null);
    setQuizSubmitted(false);
    setHighlightQuote(false);
  };

  return (
    <div className="w-full">
      {/* Tab Controls */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-xl bg-slate-100 p-1.5 shadow-inner dark:bg-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveTab("comprehension")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all ${
              activeTab === "comprehension"
                ? "bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-blue-400"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <BrainCircuit className="h-4 w-4" />
            <span>1. Comprehension Layer (Interactive Quiz & Q&A)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("trust")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all ${
              activeTab === "trust"
                ? "bg-white text-purple-600 shadow-xs dark:bg-slate-900 dark:text-purple-400"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>2. Trust & Review Layer (Verified Standards)</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Comprehension Layer */}
      {activeTab === "comprehension" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Sample Grounded Article */}
          <div className="lg:col-span-6">
            <Card className="h-full flex flex-col justify-between p-6 border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <TrustLevelBadge level="authority" size="sm" />
                    <ReviewStatusBadge badge="comprehension_ready" size="sm" />
                  </div>
                  <span className="text-[11px] text-slate-400">Sample Article</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {sampleArticle.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  By <strong className="text-slate-700 dark:text-slate-200">{sampleArticle.author}</strong> · 4 min read
                </p>

                <div className="rounded-lg bg-slate-50 p-4 text-xs leading-relaxed text-slate-700 dark:bg-slate-950/60 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                  <span>Under Multi-Version Concurrency Control (MVCC), </span>
                  <mark
                    className={`transition-colors rounded px-1 py-0.5 ${
                      highlightQuote
                        ? "bg-amber-200 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 font-medium"
                        : "bg-transparent text-inherit"
                    }`}
                  >
                    {sampleArticle.highlightSnippet}
                  </mark>
                  <span>. The vacuum process eventually reclaims dead tuples to prevent table bloat.</span>
                </div>
              </div>

              {/* Ask this Article feature */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <Search className="h-3.5 w-3.5 text-blue-500" />
                    <span>Ask This Article (Grounded Q&A)</span>
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                    Verbatim Citations
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {sampleQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedQuestionIndex(idx);
                        setHighlightQuote(true);
                      }}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                        selectedQuestionIndex === idx
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 ring-1 ring-blue-400"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      &quot;{q.query}&quot;
                    </button>
                  ))}
                </div>

                <div className="rounded-lg bg-blue-50/70 p-3 text-xs text-blue-900 dark:bg-blue-950/40 dark:text-blue-200 border border-blue-100 dark:border-blue-900/60">
                  <div className="flex items-start gap-2">
                    <Quote className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[11px] text-blue-700 dark:text-blue-300 mb-1">
                        Verbatim Quote Answer:
                      </p>
                      <p className="italic">&quot;{sampleQuestions[selectedQuestionIndex].answer}&quot;</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Check Your Understanding Quiz */}
          <div className="lg:col-span-6">
            <Card className="h-full flex flex-col justify-between p-6 border-blue-200 bg-gradient-to-br from-white to-blue-50/30 dark:border-blue-900/50 dark:from-slate-900 dark:to-slate-950">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    <Sparkles className="h-4 w-4" />
                    <span>Check Your Understanding</span>
                  </span>
                  <Badge variant="primary">Interactive Demo</Badge>
                </div>

                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  Question: What happens when PostgreSQL executes an UPDATE under MVCC?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Select an answer below to experience real-time comprehension verification:
                </p>

                <div className="space-y-2.5">
                  {quizOptions.map((opt) => {
                    const isSelected = selectedQuizOption === opt.id;
                    let optionStyle =
                      "border-slate-200 bg-white hover:border-blue-400 dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200";

                    if (quizSubmitted && isSelected) {
                      optionStyle = opt.correct
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 ring-2 ring-emerald-400"
                        : "border-red-500 bg-red-50 text-red-900 dark:bg-red-950/60 dark:text-red-200 ring-2 ring-red-400";
                    } else if (quizSubmitted && opt.correct) {
                      optionStyle =
                        "border-emerald-500/60 bg-emerald-50/50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300";
                    }

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectOption(opt.id)}
                        className={`w-full text-left rounded-xl border p-3.5 text-xs font-medium transition-all flex items-center justify-between gap-3 ${optionStyle}`}
                      >
                        <span>{opt.text}</span>
                        {quizSubmitted && isSelected && (
                          opt.correct ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                          )
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {quizSubmitted ? (
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="rounded-lg p-3 text-xs bg-slate-100 dark:bg-slate-800/80 mb-3">
                    <p className="font-semibold text-slate-900 dark:text-white mb-1">
                      {selectedQuizOption === 1 ? "🎉 Correct! Grounded in the text." : "💡 Not quite. See highlighted citation on the left."}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      Postgres writes a fresh tuple and flags the old one. Notice how the exact phrase was highlighted in the article on the left!
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" onClick={resetQuiz}>
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>💡 Click an answer above</span>
                  <span>Active Retention</span>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Trust & Review Layer */}
      {activeTab === "trust" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Trust Tier 1 */}
          <Card className="p-6 border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <TrustLevelBadge level="contributor" size="md" />
                <span className="text-[11px] font-mono text-slate-400">Tier 1</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Community Contributor
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Open to every developer. Requires email verification and compliant markdown formatting. Automated anti-spam scan ensures clean signals.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
              ✓ Email Verified · Standard Markdown
            </div>
          </Card>

          {/* Trust Tier 2 */}
          <Card className="p-6 border-blue-200 bg-blue-50/20 dark:border-blue-900/60 dark:bg-blue-950/20 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <TrustLevelBadge level="verified" size="md" />
                <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-semibold">Tier 2</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Verified Engineer
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Awarded to authors with proven track records. Code examples are syntax-checked, and articles have passed peer reviews from at least 2 community members.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-700 dark:text-blue-300 font-medium">
              ✓ Peer Reviewed · Code Syntax Checked
            </div>
          </Card>

          {/* Trust Tier 3 */}
          <Card className="p-6 border-purple-200 bg-purple-50/20 dark:border-purple-900/60 dark:bg-purple-950/20 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <TrustLevelBadge level="authority" size="md" />
                <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-semibold">Tier 3</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Domain Authority
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Recognized leaders in distributed systems, security, frontend architecture, and cloud infrastructure. Transparent editorial history.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-purple-100 dark:border-purple-900/40 text-[11px] text-purple-700 dark:text-purple-300 font-medium">
              ✓ Technical Authority · Editorial History
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
