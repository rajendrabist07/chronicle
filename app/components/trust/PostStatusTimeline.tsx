"use client";

import React from "react";
import { CheckCircle2, Clock, AlertCircle, FileText, Send } from "lucide-react";

export type PostReviewStatus = "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "REJECTED";

interface PostStatusTimelineProps {
  status: PostReviewStatus;
  createdAt?: string;
  publishedAt?: string | null;
  rejectionReason?: string | null;
  className?: string;
}

export default function PostStatusTimeline({
  status,
  createdAt,
  publishedAt,
  rejectionReason,
  className = "",
}: PostStatusTimelineProps) {
  const steps = [
    {
      key: "DRAFT",
      label: "Draft Created",
      description: "Author drafting content",
      icon: FileText,
      isCurrent: status === "DRAFT",
      isCompleted: true,
      timestamp: createdAt,
    },
    {
      key: "PENDING_REVIEW",
      label: "In Review",
      description: "Automated & peer trust checks",
      icon: Clock,
      isCurrent: status === "PENDING_REVIEW",
      isCompleted: status === "PUBLISHED" || status === "REJECTED",
    },
    {
      key: status === "REJECTED" ? "REJECTED" : "PUBLISHED",
      label: status === "REJECTED" ? "Revision Requested" : "Published Live",
      description:
        status === "REJECTED"
          ? rejectionReason || "Action required before publishing"
          : "Visible to public readers with trust badges",
      icon: status === "REJECTED" ? AlertCircle : CheckCircle2,
      isCurrent: status === "PUBLISHED" || status === "REJECTED",
      isCompleted: status === "PUBLISHED",
      isError: status === "REJECTED",
      timestamp: publishedAt,
    },
  ];

  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm ${className}`}>
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Publication Status</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Track article review and publication state</p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
            status === "PUBLISHED"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
              : status === "PENDING_REVIEW"
              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 animate-pulse"
              : status === "REJECTED"
              ? "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400"
              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          {status.replace("_", " ")}
        </span>
      </div>

      <div className="mt-5 space-y-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isLast = idx === steps.length - 1;

          return (
            <div key={step.key} className="relative flex items-start gap-4">
              {!isLast && (
                <div
                  className={`absolute left-4 top-8 -bottom-6 w-0.5 ${
                    step.isCompleted ? "bg-emerald-500 dark:bg-emerald-600" : "bg-slate-200 dark:bg-slate-800"
                  }`}
                />
              )}

              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all ${
                  step.isError
                    ? "border-red-500 bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
                    : step.isCompleted
                    ? "border-emerald-500 bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                    : step.isCurrent
                    ? "border-blue-500 bg-blue-100 text-blue-600 ring-4 ring-blue-50 dark:bg-blue-950 dark:text-blue-400 dark:ring-blue-950/50"
                    : "border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-600"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>

              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center justify-between">
                  <h4
                    className={`text-xs font-semibold ${
                      step.isError
                        ? "text-red-600 dark:text-red-400"
                        : step.isCurrent
                        ? "text-blue-600 dark:text-blue-400 font-bold"
                        : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {step.label}
                  </h4>
                  {step.timestamp && (
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      {new Date(step.timestamp).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
