import type { Metadata } from "next";
import Link from "next/link";
import { getPublicPosts, calculateReadingTime } from "../../lib/public";
import { SITE_CONFIG } from "../../lib/site";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Avatar from "../../components/ui/Avatar";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import JsonLd from "../../components/seo/JsonLd";
import { Tag as TagIcon, ArrowLeft } from "lucide-react";

interface TagPageProps {
  params: Promise<{
    tag: string;
  }>;
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  return {
    title: `#${decodedTag} Articles`,
    description: `Discover articles, stories, and engineering guides tagged with #${decodedTag} on ${SITE_CONFIG.name}.`,
    alternates: {
      canonical: `/tags/${encodeURIComponent(tag)}`,
    },
    openGraph: {
      title: `#${decodedTag} Articles — ${SITE_CONFIG.name}`,
      description: `Explore published posts filed under #${decodedTag}.`,
    },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  const postsResponse = await getPublicPosts({ tag: decodedTag, limit: 12 });
  const posts = postsResponse.data || [];
  const tagUrl = `${SITE_CONFIG.url}/tags/${encodeURIComponent(tag)}`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_CONFIG.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Topics",
        item: `${SITE_CONFIG.url}/explore`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `#${decodedTag}`,
        item: tagUrl,
      },
    ],
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <JsonLd data={breadcrumbSchema} />

      <Link
        href="/explore"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>All Topics</span>
      </Link>

      <div className="mb-8 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <TagIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              #{decodedTag}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing articles tagged with #{decodedTag} ({posts.length} {posts.length === 1 ? "article" : "articles"})
            </p>
          </div>
        </div>
      </div>

      {posts.length === 0 ? (
        <EmptyState
          title={`No articles tagged with #${decodedTag}`}
          description="Be the first writer to publish an article under this topic!"
          action={
            <Link href="/posts/new">
              <Button size="sm">Create an Article</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <Link
                    href={`/u/${post.authorId}`}
                    className="flex items-center gap-2 hover:underline"
                  >
                    <Avatar name={post.authorName || "Author"} size="xs" />
                    <span>{post.authorName || "Anonymous"}</span>
                  </Link>
                  <span>{calculateReadingTime(post.content)}</span>
                </div>

                <Link
                  href={`/read/${post.slug || post.id}`}
                  className="group mt-3 block"
                >
                  <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-xs text-slate-600 line-clamp-3 dark:text-slate-300">
                    {post.content}
                  </p>
                </Link>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {post.tags?.slice(0, 2).map((t) => (
                      <Badge key={t.id} variant="neutral">
                        #{t.name}
                      </Badge>
                    ))}
                  </div>
                  <time
                    dateTime={post.createdAt}
                    className="text-[11px] text-slate-400"
                  >
                    {new Date(post.createdAt).toLocaleDateString()}
                  </time>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
