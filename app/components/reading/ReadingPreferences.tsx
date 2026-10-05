"use client";

import { useState } from "react";
import Button from "../ui/Button";
import { Type, Eye, Share2, Check, Copy } from "lucide-react";

interface ReadingPreferencesProps {
  onFontSizeChange: (size: "normal" | "large" | "xlarge") => void;
  onZenModeToggle: (zen: boolean) => void;
  currentFontSize: "normal" | "large" | "xlarge";
  isZenMode: boolean;
  articleUrl?: string;
  articleTitle?: string;
}

export default function ReadingPreferences({
  onFontSizeChange,
  onZenModeToggle,
  currentFontSize,
  isZenMode,
  articleUrl,
  articleTitle,
}: ReadingPreferencesProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      const url = articleUrl || window.location.href;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleShare = async () => {
    const url = articleUrl || window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: articleTitle || "Chronicle Article",
          url,
        });
      } catch {
        // Ignored if cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {/* Font Size Selector */}
      <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-800 dark:bg-slate-900">
        <button
          type="button"
          onClick={() => onFontSizeChange("normal")}
          title="Normal Text Size"
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            currentFontSize === "normal"
              ? "bg-slate-100 text-blue-600 font-bold dark:bg-slate-800 dark:text-blue-400"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          A
        </button>
        <button
          type="button"
          onClick={() => onFontSizeChange("large")}
          title="Large Text Size"
          className={`rounded-md px-2.5 py-1 text-sm font-medium transition-colors ${
            currentFontSize === "large"
              ? "bg-slate-100 text-blue-600 font-bold dark:bg-slate-800 dark:text-blue-400"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          A+
        </button>
        <button
          type="button"
          onClick={() => onFontSizeChange("xlarge")}
          title="Extra Large Text Size"
          className={`rounded-md px-2.5 py-1 text-base font-medium transition-colors ${
            currentFontSize === "xlarge"
              ? "bg-slate-100 text-blue-600 font-bold dark:bg-slate-800 dark:text-blue-400"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          A++
        </button>
      </div>

      {/* Zen Focus Mode */}
      <Button
        variant={isZenMode ? "primary" : "outline"}
        size="sm"
        onClick={() => onZenModeToggle(!isZenMode)}
        title="Toggle Distraction-Free Reading Mode"
        className="h-8 gap-1.5 text-xs"
      >
        <Eye className="h-3.5 w-3.5" />
        <span>{isZenMode ? "Exit Zen" : "Zen Mode"}</span>
      </Button>

      {/* Share / Copy Link */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        className="h-8 gap-1.5 text-xs"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-600" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Share2 className="h-3.5 w-3.5" />
            <span>Share</span>
          </>
        )}
      </Button>
    </div>
  );
}
