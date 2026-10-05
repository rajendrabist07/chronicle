import React from "react";
import { ShieldCheck, CheckCircle2, Award, Sparkles } from "lucide-react";

export type TrustLevel = "contributor" | "verified" | "authority";
export type ReviewBadge = "peer_reviewed" | "code_verified" | "comprehension_ready";

interface TrustBadgeProps {
  level?: TrustLevel;
  badge?: ReviewBadge;
  size?: "sm" | "md";
  className?: string;
}

export function TrustLevelBadge({ level = "contributor", size = "sm", className = "" }: { level?: TrustLevel; size?: "sm" | "md"; className?: string }) {
  const configs = {
    contributor: {
      label: "Contributor",
      icon: CheckCircle2,
      style: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
      description: "Verified community writer",
    },
    verified: {
      label: "Verified Engineer",
      icon: ShieldCheck,
      style: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
      description: "Identity and technical credibility verified",
    },
    authority: {
      label: "Domain Authority",
      icon: Award,
      style: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800",
      description: "Recognized subject matter expert with high-signal writing",
    },
  };

  const config = configs[level] || configs.contributor;
  const Icon = config.icon;
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[11px] gap-1" : "px-2.5 py-1 text-xs gap-1.5";
  const iconSizes = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";

  return (
    <span
      title={config.description}
      className={`inline-flex items-center rounded-md border font-medium transition-colors ${config.style} ${sizeClasses} ${className}`}
    >
      <Icon className={iconSizes} />
      <span>{config.label}</span>
    </span>
  );
}

export function ReviewStatusBadge({ badge, size = "sm", className = "" }: { badge: ReviewBadge; size?: "sm" | "md"; className?: string }) {
  const configs = {
    peer_reviewed: {
      label: "Peer Reviewed",
      icon: ShieldCheck,
      style: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    },
    code_verified: {
      label: "Syntax Verified",
      icon: CheckCircle2,
      style: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800",
    },
    comprehension_ready: {
      label: "Quiz Ready",
      icon: Sparkles,
      style: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
    },
  };

  const config = configs[badge] || configs.peer_reviewed;
  const Icon = config.icon;
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px] gap-1" : "px-2.5 py-1 text-xs gap-1.5";
  const iconSizes = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";

  return (
    <span
      className={`inline-flex items-center rounded-md border font-medium ${config.style} ${sizeClasses} ${className}`}
    >
      <Icon className={iconSizes} />
      <span>{config.label}</span>
    </span>
  );
}
