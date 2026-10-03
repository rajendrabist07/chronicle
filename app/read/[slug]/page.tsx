import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import {
  getPublicPostBySlug,
  getPublicPostComments,
  calculateReadingTime,
} from "../../lib/public";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import PublicPostComments from "../../components/comments/PublicPostComments";
import { ArrowLeft, Calendar, Clock } from "lucide-react";

interface ReadPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ReadPostPage({ params }: ReadPageProps) {
  const { slug } = await params;
  const post = await getPublicPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const comments = await getPublicPostComments(slug);
  const readingTime = calculateReadingTime(post.content);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Back to explore link */}
      <Link
        href="/explore"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Explore</span>
      </Link>

      <article>
        {/* Article Header */}
        <header className="mb-8 space-y-4">
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
                <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                  {post.authorName || "Anonymous Writer"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Author</p>
              </div>
            </Link>

            {/* Meta (Date & Reading Time) */}
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <time dateTime={post.createdAt}>
                  {new Date(post.createdAt).toLocaleDateString(undefined, {
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
            <div className="flex flex-wrap gap-2 pt-2">
              {post.tags.map((tag) => (
                <Link key={tag.id} href={`/tags/${encodeURIComponent(tag.name)}`}>
                  <Badge variant="primary" className="hover:opacity-80">
                    #{tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* Markdown Rendered Article Body */}
        <div className="prose prose-slate max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </article>

      {/* Comments & Discussion */}
      <PublicPostComments postId={post.id} initialComments={comments} />
    </main>
  );
}
