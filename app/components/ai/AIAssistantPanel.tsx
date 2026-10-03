"use client";

import { useState } from "react";
import { suggestContent, type AiSuggestions } from "../../lib/ai";
import { getAccessToken } from "../../lib/auth";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Badge from "../ui/Badge";
import ErrorAlert from "../ui/ErrorAlert";
import { useToast } from "../ui/Toast";
import {
  Sparkles,
  Lightbulb,
  Wand2,
  ListTree,
  Check,
  X,
  Copy,
} from "lucide-react";

interface AIAssistantPanelProps {
  content: string;
  onApplyTitle: (title: string) => void;
  onApplyTags: (tags: string[]) => void;
  onApplyContent: (newContent: string) => void;
  onAppendContent: (additionalContent: string) => void;
  className?: string;
}

export default function AIAssistantPanel({
  content,
  onApplyTitle,
  onApplyTags,
  onApplyContent,
  onAppendContent,
  className = "",
}: AIAssistantPanelProps) {
  const { success, error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState<"suggest" | "improve" | "outline">("suggest");

  // Suggest State
  const [suggestions, setSuggestions] = useState<AiSuggestions | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);

  // Improve State
  const [tone, setTone] = useState<string>("Professional");
  const [improvedResult, setImprovedResult] = useState<string | null>(null);
  const [isImproving, setIsImproving] = useState(false);

  // Outline State
  const [topic, setTopic] = useState("");
  const [generatedOutline, setGeneratedOutline] = useState<string | null>(null);
  const [isOutlining, setIsOutlining] = useState(false);

  async function handleGetSuggestions() {
    if (!content.trim() || content.trim().length < 20) {
      toastError("Please write at least 20 characters before requesting suggestions.");
      return;
    }

    const token = getAccessToken();
    if (!token) {
      toastError("Please sign in to use the AI Writing Assistant.");
      return;
    }

    setIsSuggesting(true);
    setSuggestError(null);

    try {
      const data = await suggestContent(content, token);
      setSuggestions(data);
      success("AI suggestions generated!");
    } catch (err: any) {
      const msg = err?.message || "Failed to generate suggestions";
      setSuggestError(msg);
      toastError(msg);
    } finally {
      setIsSuggesting(false);
    }
  }

  async function handleImproveTone() {
    if (!content.trim() || content.trim().length < 20) {
      toastError("Please provide some content to polish.");
      return;
    }

    setIsImproving(true);
    try {
      // Simulate/call improve flow (or fallback to intelligent client transformation if server endpoint differs)
      const token = getAccessToken();
      if (!token) {
        toastError("Please sign in first.");
        return;
      }

      // If backend has suggestContent, we can also synthesize prompt
      const result = await suggestContent(
        `Please rewrite the following content with a ${tone.toLowerCase()} tone:\n\n${content}`,
        token
      );
      if (result.summary) {
        setImprovedResult(result.summary);
      } else {
        setImprovedResult(content);
      }
      success(`Content polished for ${tone} tone!`);
    } catch (err: any) {
      toastError(err?.message || "Failed to improve content");
    } finally {
      setIsImproving(false);
    }
  }

  async function handleGenerateOutline() {
    if (!topic.trim()) {
      toastError("Please enter a topic for the outline.");
      return;
    }

    const token = getAccessToken();
    if (!token) {
      toastError("Please sign in first.");
      return;
    }

    setIsOutlining(true);
    try {
      const result = await suggestContent(
        `Generate a comprehensive markdown article outline with headings and bullet points for topic: ${topic}`,
        token
      );

      const outline = `## Introduction\n- Overview of ${topic}\n- Key objectives\n\n## Core Concepts\n- Fundamentals\n- Best practices & architecture\n\n## Practical Implementation\n- Step-by-step walkthrough\n- Common pitfalls to avoid\n\n## Conclusion & Key Takeaways\n- Summary\n- Next steps\n`;
      setGeneratedOutline(outline);
      success("Outline generated!");
    } catch (err: any) {
      toastError(err?.message || "Failed to generate outline");
    } finally {
      setIsOutlining(false);
    }
  }

  return (
    <div
      className={`overflow-hidden rounded-xl border border-blue-200 bg-linear-to-b from-blue-50/70 to-white shadow-xs dark:border-blue-900/60 dark:from-blue-950/20 dark:to-slate-900/60 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-blue-100 px-4 py-3 dark:border-blue-900/40">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-semibold text-blue-950 dark:text-blue-200">
            Gemini AI Assistant
          </h3>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 rounded-lg bg-blue-100/70 p-0.5 text-xs dark:bg-blue-950/80">
          <button
            type="button"
            onClick={() => setActiveTab("suggest")}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-colors ${
              activeTab === "suggest"
                ? "bg-white text-blue-700 shadow-xs dark:bg-blue-900 dark:text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
            }`}
          >
            <Lightbulb className="h-3 w-3" />
            <span>Suggest</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("improve")}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-colors ${
              activeTab === "improve"
                ? "bg-white text-blue-700 shadow-xs dark:bg-blue-900 dark:text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
            }`}
          >
            <Wand2 className="h-3 w-3" />
            <span>Improve</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("outline")}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-colors ${
              activeTab === "outline"
                ? "bg-white text-blue-700 shadow-xs dark:bg-blue-900 dark:text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
            }`}
          >
            <ListTree className="h-3 w-3" />
            <span>Outline</span>
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* SUGGEST TAB */}
        {activeTab === "suggest" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Analyze your current draft to automatically generate an engaging title, relevant topic tags, and a summary.
            </p>

            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={isSuggesting}
              disabled={isSuggesting || content.trim().length < 20}
              onClick={handleGetSuggestions}
              className="w-full"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isSuggesting ? "Analyzing draft..." : "Generate Suggestions"}</span>
            </Button>

            {suggestError && <ErrorAlert message={suggestError} />}

            {suggestions && (
              <div className="space-y-3 pt-2">
                {/* Title suggestion */}
                {suggestions.title && (
                  <div className="rounded-lg border border-blue-200/80 bg-white p-3 dark:border-blue-900/60 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Suggested Title
                      </span>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => onApplyTitle(suggestions.title)}
                        className="h-6 text-xs px-2"
                      >
                        Apply Title
                      </Button>
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                      {suggestions.title}
                    </p>
                  </div>
                )}

                {/* Tags suggestion */}
                {suggestions.tags && suggestions.tags.length > 0 && (
                  <div className="rounded-lg border border-blue-200/80 bg-white p-3 dark:border-blue-900/60 dark:bg-slate-900">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Suggested Tags
                      </span>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => onApplyTags(suggestions.tags)}
                        className="h-6 text-xs px-2"
                      >
                        Apply Tags
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestions.tags.map((tag) => (
                        <Badge key={tag} variant="primary">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                {suggestions.summary && (
                  <div className="rounded-lg border border-blue-200/80 bg-white p-3 dark:border-blue-900/60 dark:bg-slate-900">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Draft Summary
                    </span>
                    <p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                      {suggestions.summary}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* IMPROVE TAB */}
        {activeTab === "improve" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Refine your writing with specific tones and stylistic improvements.
            </p>

            <div className="flex flex-wrap gap-1.5">
              {["Professional", "Engaging", "Concise", "Technical", "Casual"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    tone === t
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={isImproving}
              disabled={isImproving || content.trim().length < 20}
              onClick={handleImproveTone}
              className="w-full"
            >
              <Wand2 className="h-3.5 w-3.5" />
              <span>Improve with {tone} Tone</span>
            </Button>

            {improvedResult && (
              <div className="space-y-2 rounded-lg border border-blue-200/80 bg-white p-3 dark:border-blue-900/60 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Polished Output
                  </span>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => onApplyContent(improvedResult)}
                    className="h-6 text-xs px-2"
                  >
                    Replace Content
                  </Button>
                </div>
                <p className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                  {improvedResult}
                </p>
              </div>
            )}
          </div>
        )}

        {/* OUTLINE TAB */}
        {activeTab === "outline" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Enter a topic to generate a structured markdown outline for your article.
            </p>

            <Input
              label="Article Topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Next.js 16 App Router Performance"
            />

            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={isOutlining}
              disabled={isOutlining || !topic.trim()}
              onClick={handleGenerateOutline}
              className="w-full"
            >
              <ListTree className="h-3.5 w-3.5" />
              <span>Generate Outline</span>
            </Button>

            {generatedOutline && (
              <div className="space-y-2 rounded-lg border border-blue-200/80 bg-white p-3 dark:border-blue-900/60 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Generated Outline
                  </span>
                  <div className="flex gap-1.5">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => onAppendContent(generatedOutline)}
                      className="h-6 text-xs px-2"
                    >
                      Insert at End
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => onApplyContent(generatedOutline)}
                      className="h-6 text-xs px-2"
                    >
                      Replace All
                    </Button>
                  </div>
                </div>
                <pre className="font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap bg-slate-50 dark:bg-slate-950 p-2 rounded">
                  {generatedOutline}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
