import Link from "next/link";
import { getPublicPosts, calculateReadingTime } from "./lib/public";
import type { Post } from "./types";
import { SITE_CONFIG } from "./lib/site";
import Button from "./components/ui/Button";
import Card from "./components/ui/Card";
import Badge from "./components/ui/Badge";
import Avatar from "./components/ui/Avatar";
import JsonLd from "./components/seo/JsonLd";
import {
  Sparkles,
  MessageSquare,
  Tags,
  ShieldCheck,
  ArrowRight,
  PenTool,
  BookOpen,
  Compass,
} from "lucide-react";

export default async function HomePage() {
  let latestPosts: Post[] = [];
  let fetchFailed = false;

  try {
    const postsResponse = await getPublicPosts({ limit: 3 });
    latestPosts = postsResponse.data || [];
  } catch (err) {
    fetchFailed = true;
    console.error("Failed to load latest posts on home page:", err);
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_CONFIG.url}/explore?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/icon.svg`,
  };

  return (
    <div className="flex flex-col gap-16 pb-16">
      <JsonLd data={websiteSchema} />
      <JsonLd data={organizationSchema} />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-slate-50 via-white to-white py-20 transition-colors dark:border-slate-800/80 dark:from-slate-900/50 dark:via-slate-950 dark:to-slate-950">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1 text-xs font-semibold text-blue-700 shadow-xs dark:border-blue-900/60 dark:bg-blue-950/50 dark:text-blue-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Powered by Google Gemini 2.0 AI</span>
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl dark:text-white">
            Publish ideas that matter. <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
              Enhanced by Intelligence.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-600 sm:text-lg dark:text-slate-300">
            {SITE_CONFIG.description}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/register">
              <Button size="lg" className="shadow-md">
                <span>Start Writing for Free</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant="secondary" size="lg">
                <Compass className="h-4 w-4" />
                <span>Explore Articles</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works (3 Steps) */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            How {SITE_CONFIG.name} Works
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            A frictionless workflow designed for writers, engineers, and creators.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              1
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
              Write in Markdown
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Compose cleanly with live sanitized preview, formatting shortcuts, and local draft autosave.
            </p>
          </div>

          <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              2
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
              Supercharge with AI
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Get catchy title suggestions, concise summaries, and smart tag categorization in one click.
            </p>
          </div>

          <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 font-bold text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              3
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
              Publish & Engage
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Reach readers with high-performance SEO pages, social share cards, and nested discussions.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Features Grid */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Card className="flex flex-col justify-between p-6">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                Gemini AI Writing Companion
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Overcome writer&apos;s block instantly. Generate structured outlines, polish tone, and discover relevant tags from your content.
              </p>
            </div>
          </Card>

          <Card className="flex flex-col justify-between p-6">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                Threaded Community Discussions
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Engage in structured conversations on any article with inline comment editing, replies, and author identity badges.
              </p>
            </div>
          </Card>

          <Card className="flex flex-col justify-between p-6">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <Tags className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                Multi-Dimensional Tagging
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Organize and explore stories across topics, engineering domains, and categories with automatic slug matching.
              </p>
            </div>
          </Card>

          <Card className="flex flex-col justify-between p-6">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                JWT Auth & Role Permissions
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Hardened authentication with mutex-safe token refresh, bcrypt hashing, and Owner/Admin/Member role hierarchies.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Latest Public Articles */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Latest Published Articles
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Discover stories, tutorials, and perspectives from the community.
            </p>
          </div>
          <Link
            href="/explore"
            className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            <span>View all</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {fetchFailed ? (
          <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50/60 p-8 text-center dark:border-amber-900/40 dark:bg-amber-950/30">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              Latest articles are temporarily unavailable.
            </p>
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
              The server may be waking up or updating. You can explore or start writing below.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Link href="/">
                <Button variant="secondary" size="sm">
                  Refresh
                </Button>
              </Link>
            </div>
          </div>
        ) : latestPosts.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
            <BookOpen className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              No public articles published yet. Be the first to publish!
            </p>
            <div className="mt-4">
              <Link href="/posts/new">
                <Button size="sm">Create First Post</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {latestPosts.map((post) => (
              <Card
                key={post.id}
                className="flex flex-col justify-between transition-transform hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Avatar name={post.authorName || "Author"} size="xs" />
                    <span>{post.authorName || "Anonymous"}</span>
                    <span>·</span>
                    <span>{calculateReadingTime(post.content)}</span>
                  </div>

                  <Link href={`/read/${post.slug || post.id}`} className="group block mt-3">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 line-clamp-3 dark:text-slate-300">
                      {post.content}
                    </p>
                  </Link>
                </div>

                {post.tags && post.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                    {post.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag.id} variant="neutral">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Bottom CTA Banner */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white shadow-lg sm:p-12">
          <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">
            Ready to publish your next piece?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-blue-100 sm:text-base">
            Join thousands of writers sharing engineering knowledge, deep dives, and ideas.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-white text-blue-700 hover:bg-blue-50 shadow-md"
              >
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
