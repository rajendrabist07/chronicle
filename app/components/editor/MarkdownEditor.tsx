"use client";

import { useState, useEffect, useRef, useId } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { calculateReadingTime } from "../../lib/public";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Code,
  Quote,
  List,
  Eye,
  Edit3,
  RotateCcw,
} from "lucide-react";

export interface MarkdownEditorProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  placeholder?: string;
  rows?: number;
  draftKey?: string;
  className?: string;
}

export default function MarkdownEditor({
  id: customId,
  label,
  value,
  onChange,
  error,
  placeholder = "Write in Markdown...",
  rows = 12,
  draftKey,
  className = "",
}: MarkdownEditorProps) {
  const autoId = useId();
  const id = customId || autoId;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  // Restore draft from localStorage on mount if value is initially empty
  useEffect(() => {
    if (!draftKey || typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(`chronicle_draft_${draftKey}`);
      if (saved && !value && saved.trim() !== "") {
        onChange(saved);
        setHasRestoredDraft(true);
      }
    } catch {
      // ignore
    }
  }, [draftKey, onChange]);

  // Autosave to localStorage on change
  useEffect(() => {
    if (!draftKey || typeof window === "undefined") return;
    try {
      if (value) {
        localStorage.setItem(`chronicle_draft_${draftKey}`, value);
      }
    } catch {
      // ignore
    }
  }, [value, draftKey]);

  function handleClearDraft() {
    if (!draftKey || typeof window === "undefined") return;
    localStorage.removeItem(`chronicle_draft_${draftKey}`);
    onChange("");
    setHasRestoredDraft(false);
  }

  // Insert markdown formatting at cursor / selection
  function insertFormat(prefix: string, suffix: string = "", defaultPlaceholder: string = "") {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || defaultPlaceholder;

    const before = value.substring(0, start);
    const after = value.substring(end);

    const replacement = `${prefix}${selectedText}${suffix}`;
    const nextValue = `${before}${replacement}${after}`;

    onChange(nextValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 0);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const isMac = typeof navigator !== "undefined" && /Mac/.test(navigator.userAgent);
    const modKey = isMac ? e.metaKey : e.ctrlKey;

    if (modKey && e.key.toLowerCase() === "b") {
      e.preventDefault();
      insertFormat("**", "**", "bold text");
    } else if (modKey && e.key.toLowerCase() === "i") {
      e.preventDefault();
      insertFormat("*", "*", "italic text");
    } else if (modKey && e.key.toLowerCase() === "k") {
      e.preventDefault();
      insertFormat("[", "](https://example.com)", "link title");
    }
  }

  // Metrics
  const charCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const readingTime = calculateReadingTime(value);

  return (
    <div className={`w-full space-y-2 ${className}`}>
      {/* Header with Label and Tab Switch */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-slate-900 dark:text-slate-100"
          >
            {label}
          </label>
        )}

        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setActiveTab("write")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              activeTab === "write"
                ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Write</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              activeTab === "preview"
                ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Restored draft banner */}
      {hasRestoredDraft && (
        <div className="flex items-center justify-between rounded-md bg-blue-50 px-3 py-1.5 text-xs text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
          <span>Draft autosaved from previous session restored.</span>
          <button
            type="button"
            onClick={handleClearDraft}
            className="flex items-center gap-1 font-semibold hover:underline"
          >
            <RotateCcw className="h-3 w-3" />
            Clear draft
          </button>
        </div>
      )}

      {/* Editor Container */}
      <div
        className={`rounded-xl border bg-white transition-colors dark:bg-slate-950 ${
          error
            ? "border-red-500 focus-within:ring-1 focus-within:ring-red-500"
            : "border-slate-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 dark:border-slate-700"
        }`}
      >
        {/* Formatting Toolbar (Only in write mode) */}
        {activeTab === "write" && (
          <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50/70 px-3 py-1.5 dark:border-slate-800 dark:bg-slate-900/50">
            <button
              type="button"
              onClick={() => insertFormat("**", "**", "bold")}
              title="Bold (Ctrl/Cmd+B)"
              className="rounded p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <Bold className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormat("*", "*", "italic")}
              title="Italic (Ctrl/Cmd+I)"
              className="rounded p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <Italic className="h-3.5 w-3.5" />
            </button>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
            <button
              type="button"
              onClick={() => insertFormat("## ", "", "Heading 2")}
              title="Heading 2"
              className="rounded p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <Heading2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormat("### ", "", "Heading 3")}
              title="Heading 3"
              className="rounded p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <Heading3 className="h-3.5 w-3.5" />
            </button>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
            <button
              type="button"
              onClick={() => insertFormat("[", "](url)", "link text")}
              title="Link (Ctrl/Cmd+K)"
              className="rounded p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <LinkIcon className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormat("```\n", "\n```", "code here")}
              title="Code Block"
              className="rounded p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <Code className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormat("> ", "", "quote")}
              title="Blockquote"
              className="rounded p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <Quote className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormat("- ", "", "list item")}
              title="Bullet List"
              className="rounded p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Content Area */}
        {activeTab === "write" ? (
          <textarea
            ref={textareaRef}
            id={id}
            rows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full resize-y bg-transparent p-4 font-mono text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
          />
        ) : (
          <div className="min-h-[220px] p-4 prose prose-slate max-w-none dark:prose-invert prose-headings:font-bold prose-pre:bg-slate-900 text-slate-800 dark:text-slate-200">
            {value.trim() ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
              >
                {value}
              </ReactMarkdown>
            ) : (
              <p className="italic text-slate-400">Nothing to preview yet.</p>
            )}
          </div>
        )}

        {/* Metrics Footer */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-100 px-4 py-2 text-[11px] text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{charCount} characters</span>
          </div>
          <span>~{readingTime}</span>
        </div>
      </div>

      {error && (
        <p className="text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
