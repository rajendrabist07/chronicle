"use client";

import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import ReadingProgressBar from "./ReadingProgressBar";
import TableOfContents, { extractHeadings } from "./TableOfContents";
import ComprehensionQuiz from "./ComprehensionQuiz";
import AskThisArticle from "./AskThisArticle";
import ReadingPreferences from "./ReadingPreferences";
import { TrustLevelBadge, ReviewStatusBadge } from "../trust/TrustBadge";
import Avatar from "../ui/Avatar";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import ArticleActionBar from "../engagement/ArticleActionBar";
import PublicPostComments from "../comments/PublicPostComments";
import type { Post } from "../../types";
import type { Comment } from "../../lib/comments";
import { Calendar, Clock, ArrowLeft, ShieldCheck } from "lucide-react";

interface ArticleReaderViewProps {
  post: Post;
  comments: Comment[];
  readingTime: string;
  postUrl: string;
}

export default function ArticleReaderView({
  post,
  comments,
  readingTime,
  postUrl,
}: ArticleReaderViewProps) {
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">("normal");
  const [isZenMode, setIsZenMode] = useState(false);

  const headings = extractHeadings(post.content);

  const fontSizeClass = {
    normal: "prose-base leading-relaxed",
    large: "prose-lg leading-loose",
    xlarge: "prose-xl leading-loose",
  }[fontSize];

  return (
    <>
      <ReadingProgressBar />

      <div className={`mx-auto px-4 py-8 sm:px-6 transition-all ${isZenMode ? "max-w-3xl" : "max-w-6xl"}`}>
        {/* Navigation & Controls Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Explore</span>
          </Link>

          <ReadingPreferences
            onFontSizeChange={setFontSize}
            onZenModeToggle={setIsZenMode}
            currentFontSize={fontSize}
            isZenMode={isZenMode}
            articleUrl={postUrl}
            articleTitle={post.title}
          />
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Main Article Content Column */}
          <div className={isZenMode ? "lg:col-span-12" : "lg:col-span-8"}>
            <article>
              {/* Article Header */}
              <header className="mb-8 space-y-4">
                {/* Trust & Review Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <TrustLevelBadge level="verified" size="sm" />
                  <ReviewStatusBadge badge="comprehension_ready" size="sm" />
                </div>

                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white leading-tight">
                  {post.title}
                </h1>

                <div className="flex flex-wrap items-center justify-between gap-4 border-y border-slate-200 py-4 dark:border-slate-800">
                  {/* Author */}
                  <Link
                    href={`/u/${post.authorId}`}
                    className="flex items-center gap-3 group"
                  >
                    <Avatar name={post.authorName || "Author"} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                          {post.authorName || "Anonymous Writer"}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Technical Writer
                      </p>
                    </div>
                  </Link>

                  {/* Meta (Date & Reading Time) */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <time dateTime={post.publishedAt || post.createdAt}>
                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{readingTime}</span>
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {post.tags.map((tag) => (
                      <Link key={tag.id} href={`/tags/${encodeURIComponent(tag.name)}`}>
                        <Badge variant="primary" className="max-w-[180px] truncate hover:opacity-80">
                          #{tag.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </header>

              {/* Action Bar (Like, Save, Share) */}
              <div className="mt-4 mb-8">
                <ArticleActionBar
                  postId={post.id}
                  slug={post.slug}
                  commentsCount={comments.length}
                />
              </div>

              {/* Mobile Table of Contents (collapsible) */}
              {!isZenMode && headings.length > 0 && (
                <div className="mb-8 block lg:hidden">
                  <TableOfContents headings={headings} />
                </div>
              )}

              {/* Markdown Article Body */}
              <div className={`prose prose-slate max-w-none dark:prose-invert prose-headings:font-bold prose-headings:scroll-mt-20 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 text-slate-800 dark:text-slate-200 ${fontSizeClass}`}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeSanitize]}
                  components={{
                    h2: ({ children, ...props }) => {
                      const text = String(children);
                      const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
                      return <h2 id={id} {...props}>{children}</h2>;
                    },
                    h3: ({ children, ...props }) => {
                      const text = String(children);
                      const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
                      return <h3 id={id} {...props}>{children}</h3>;
                    },
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </div>

              {/* Action Bar Bottom */}
              <div className="mt-10 mb-10">
                <ArticleActionBar
                  postId={post.id}
                  slug={post.slug}
                  commentsCount={comments.length}
                />
              </div>

              {/* Comprehension Quiz Module (Active Learning) */}
              <section className="my-10" aria-label="Comprehension Check">
                <ComprehensionQuiz
                  articleTitle={post.title}
                  articleContent={post.content}
                />
              </section>

              {/* Author Trust & Bio Card */}
              <Card className="my-10 p-6 border-slate-200 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <Avatar name={post.authorName || "Author"} size="lg" />
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {post.authorName || "Chronicle Writer"}
                      </h4>
                      <TrustLevelBadge level="verified" size="sm" />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                      Published engineer sharing architectural insights and verified code patterns on Chronicle.
                    </p>
                    <Link
                      href={`/u/${post.authorId}`}
                      className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                    >
                      View full author profile & stories →
                    </Link>
                  </div>
                </div>
              </Card>

              {/* Comments & Discussion */}
              <PublicPostComments postId={post.id} initialComments={comments} />
            </article>
          </div>

          {/* Desktop Sticky Sidebar (TOC & Ask this Article) */}
          {!isZenMode && (
            <aside className="hidden lg:col-span-4 lg:block">
              <div className="sticky top-20 space-y-6">
                {headings.length > 0 && <TableOfContents headings={headings} />}
                <AskThisArticle content={post.content} />
              </div>
            </aside>
          )}
        </div>
      </div>
    </>
  );
}
