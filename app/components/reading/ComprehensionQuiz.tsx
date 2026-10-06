"use client";

import { useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import {
  BrainCircuit,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  RotateCcw,
  Quote,
  Award,
} from "lucide-react";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  verbatimCitation?: string;
}

interface ComprehensionQuizProps {
  articleTitle: string;
  questions?: QuizQuestion[];
  articleContent?: string;
  className?: string;
}

export default function ComprehensionQuiz({
  articleTitle,
  questions,
  className = "",
}: ComprehensionQuizProps) {
  // Milestone F4-1: Honesty Gate. Never fabricate quiz questions.
  // If no questions exist from the verified backend, render nothing.
  if (!questions || questions.length === 0) {
    return null;
  }

  const quizQuestions = questions;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<Record<number, boolean>>({});
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQ = quizQuestions[currentQuestionIndex];
  const totalQuestions = quizQuestions.length;
  const currentAnswer = selectedAnswers[currentQuestionIndex];
  const isCurrentSubmitted = Boolean(isSubmitted[currentQuestionIndex]);

  const handleSelectOption = (optionIndex: number) => {
    if (isCurrentSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestionIndex]: optionIndex }));
    setIsSubmitted((prev) => ({ ...prev, [currentQuestionIndex]: true }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setIsSubmitted({});
    setCurrentQuestionIndex(0);
    setQuizFinished(false);
  };

  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score += 1;
      }
    });
    return score;
  };

  return (
    <Card
      className={`border-blue-200 bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 p-6 shadow-sm dark:border-blue-900/60 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-100 pb-4 dark:border-blue-950">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <BrainCircuit className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Check Your Understanding
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Interactive comprehension check grounded in this article
            </p>
          </div>
        </div>

        <Badge variant="primary" className="text-[11px]">
          {quizFinished
            ? "Complete"
            : totalQuestions === 1
            ? "Quick Check"
            : `Question ${currentQuestionIndex + 1} of ${totalQuestions}`}
        </Badge>
      </div>

      {quizFinished ? (
        /* Results View */
        <div className="py-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mb-3">
            <Award className="h-6 w-6" />
          </div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">
            Comprehension Check Complete!
          </h4>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            You scored <strong className="text-blue-600 dark:text-blue-400">{calculateScore()}</strong> out of <strong>{totalQuestions}</strong> correctly.
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <Button size="sm" variant="secondary" onClick={resetQuiz}>
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              <span>Retake Quiz</span>
            </Button>
          </div>
        </div>
      ) : (
        /* Question View */
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            {currentQ.question}
          </h4>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt, optIdx) => {
              const isSelected = currentAnswer === optIdx;
              const isCorrect = optIdx === currentQ.correctIndex;

              let style =
                "border-slate-200 bg-white hover:border-blue-400 dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200";

              if (isCurrentSubmitted) {
                if (isSelected && isCorrect) {
                  style =
                    "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 ring-2 ring-emerald-400";
                } else if (isSelected && !isCorrect) {
                  style =
                    "border-red-500 bg-red-50 text-red-900 dark:bg-red-950/60 dark:text-red-200 ring-2 ring-red-400";
                } else if (isCorrect) {
                  style =
                    "border-emerald-500/60 bg-emerald-50/50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300";
                } else {
                  style = "opacity-60 border-slate-200 dark:border-slate-800";
                }
              }

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(optIdx)}
                  disabled={isCurrentSubmitted}
                  className={`w-full text-left rounded-xl border p-3 text-xs font-medium transition-all flex items-start justify-between gap-3 ${style}`}
                >
                  <span className="leading-relaxed">{opt}</span>
                  {isCurrentSubmitted && isSelected && (
                    isCorrect ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                    )
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation & Citation */}
          {isCurrentSubmitted && (
            <div className="mt-4 rounded-xl bg-slate-100 p-4 text-xs text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
              <p className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                {currentAnswer === currentQ.correctIndex ? (
                  <>
                    <span className="text-emerald-600 dark:text-emerald-400">✓ Correct!</span>
                    <span>Grounded Explanation</span>
                  </>
                ) : (
                  <>
                    <span className="text-red-600 dark:text-red-400">✗ Explanation</span>
                  </>
                )}
              </p>
              <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                {currentQ.explanation}
              </p>

              {currentQ.verbatimCitation && (
                <div className="mt-2.5 flex items-start gap-1.5 rounded-lg bg-white/80 p-2.5 text-[11px] text-slate-600 dark:bg-slate-900/80 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800">
                  <Quote className="h-3.5 w-3.5 shrink-0 text-blue-500 mt-0.5" />
                  <p className="italic">
                    <strong>Verbatim Citation:</strong> &quot;{currentQ.verbatimCitation}&quot;
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-slate-800">
            {totalQuestions > 1 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
            ) : (
              <div />
            )}

            <Button
              size="sm"
              onClick={handleNext}
              disabled={!isCurrentSubmitted}
            >
              {currentQuestionIndex < totalQuestions - 1 ? "Next Question" : "Finish Quiz"}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
