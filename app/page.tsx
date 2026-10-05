import Link from "next/link";
import { getPublicPosts, calculateReadingTime } from "./lib/public";
import type { Post } from "./types";
import { SITE_CONFIG } from "./lib/site";
import Button from "./components/ui/Button";
import Card from "./components/ui/Card";
import Badge from "./components/ui/Badge";
import Avatar from "./components/ui/Avatar";
import JsonLd from "./components/seo/JsonLd";
import InteractiveFeaturePreview from "./components/home/InteractiveFeaturePreview";
import { TrustLevelBadge, ReviewStatusBadge } from "./components/trust/TrustBadge";
import {
  Sparkles,
  ShieldCheck,
  BrainCircuit,
  ArrowRight,
  BookOpen,
  Compass,
  CheckCircle2,
  Terminal,
  Layers,
  Search,
} from "lucide-react";

export default async function HomePage() {
  let latestPosts: Post[] = [];
  let fetchFailed = false;

  try {
    const postsResponse = await getPublicPosts({ limit: 6 });
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

  const featuredTopics = [
    { name: "TypeScript", tag: "typescript" },
    { name: "Next.js", tag: "nextjs" },
    { name: "System Design", tag: "system-design" },
    { name: "PostgreSQL", tag: "postgres" },
    { name: "Architecture", tag: "architecture" },
    { name: "DevOps", tag: "devops" },
    { name: "React", tag: "react" },
  ];

  return (
    <div className="flex flex-col gap-20 pb-20">
      <JsonLd data={websiteSchema} />
      <JsonLd data={organizationSchema} />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-slate-50 via-white to-white py-20 transition-colors dark:border-slate-800/80 dark:from-slate-900/50 dark:via-slate-950 dark:to-slate-950">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-4 py-1.5 text-xs font-semibold text-blue-700 shadow-xs dark:border-blue-900/60 dark:bg-blue-950/50 dark:text-blue-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Powered by {SITE_CONFIG.aiProvider} · Grounded Engineering Knowledge</span>
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl dark:text-white leading-[1.15]">
            Technical writing you can trust — <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
              and learn from.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-600 sm:text-lg dark:text-slate-300 leading-relaxed">
            {SITE_CONFIG.description}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/register">
              <Button size="lg" className="shadow-md">
                <span>Start Writing</span>
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

          {/* Quick Topic Chips */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Trending Topics:</span>
            {featuredTopics.map((topic) => (
              <Link
                key={topic.tag}
                href={`/tags/${encodeURIComponent(topic.tag)}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-800 dark:hover:text-blue-400"
              >
                #{topic.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Core Thesis Preview (Comprehension + Trust) */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Experience the Two Layers of Chronicle
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Try the interactive comprehension quiz and explore how trust levels protect reading quality in real-time.
          </p>
        </div>

        <InteractiveFeaturePreview />
      </section>

      {/* Core Architectural Pillars */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Why Technical Writers Choose {SITE_CONFIG.name}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Designed from the ground up for high-signal engineering and active reader retention.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6 flex flex-col justify-between border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mb-4">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Active Comprehension
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Articles can include embedded check-your-understanding quizzes and grounded Q&A with verbatim text citations.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
              Zero fluff retention
            </div>
          </Card>

          <Card className="p-6 flex flex-col justify-between border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400 mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Transparent Trust Model
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Verified writer levels, peer review audit badges, and clear identity without paywalls or algorithmic clickbait.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-purple-600 dark:text-purple-400 font-medium">
              High signal reputation
            </div>
          </Card>

          <Card className="p-6 flex flex-col justify-between border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 mb-4">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {SITE_CONFIG.aiProvider} Companion
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Generate catchy title suggestions, concise technical summaries, and auto-generated comprehension quizzes.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
              AI as an editor, not author
            </div>
          </Card>

          <Card className="p-6 flex flex-col justify-between border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mb-4">
                <Terminal className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Developer Native
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Full GitHub Flavored Markdown, code syntax highlighting, keyboard shortcuts, autosaved drafts, and sanitized output.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Built for engineering
            </div>
          </Card>
        </div>
      </section>

      {/* Latest High-Signal Articles */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Latest Published Articles
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Explore deep dives, tutorials, and system designs from the community.
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
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestPosts.map((post) => (
              <Card
                key={post.id}
                className="flex flex-col justify-between transition-transform hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Link
                      href={`/u/${post.authorId}`}
                      className="flex items-center gap-2 hover:underline truncate"
                    >
                      <Avatar name={post.authorName || "Author"} size="xs" />
                      <span className="truncate">{post.authorName || "Anonymous"}</span>
                    </Link>
                    <span className="shrink-0">{calculateReadingTime(post.content)}</span>
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

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1 overflow-hidden">
                      {post.tags?.slice(0, 2).map((tag) => (
                        <Badge key={tag.id} variant="neutral" className="max-w-[120px] truncate">
                          #{tag.name}
                        </Badge>
                      ))}
                    </div>
                    <time
                      dateTime={post.publishedAt || post.createdAt}
                      className="shrink-0 text-[11px] text-slate-400"
                    >
                      {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                    </time>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Bottom CTA Banner */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-center text-white shadow-lg sm:p-12">
          <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">
            Ready to publish your next piece?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-blue-100 sm:text-base">
            Join thoughtful writers sharing engineering knowledge, deep dives, and ideas.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-white text-blue-700 hover:bg-blue-50 shadow-md font-semibold"
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
