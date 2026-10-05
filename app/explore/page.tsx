import type { Metadata } from "next";
import Link from "next/link";
import { getPublicPosts, getPublicTags, calculateReadingTime } from "../lib/public";
import { formatRelativeTime } from "../lib/time";
import { SITE_CONFIG, getSiteUrl } from "../lib/site";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import Pagination from "../components/ui/Pagination";
import ExploreSearchInput from "../components/explore/ExploreSearchInput";
import { Compass, BookOpen } from "lucide-react";

interface ExplorePageProps {
  searchParams: Promise<{
    q?: string;
    tag?: string;
    sort?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ searchParams }: ExplorePageProps): Promise<Metadata> {
  const resolved = await searchParams;
  const isSearching = Boolean(resolved.q);
  const siteUrl = getSiteUrl();

  const title = resolved.tag
    ? `#${resolved.tag} Articles — ${SITE_CONFIG.name}`
    : `Explore Articles — ${SITE_CONFIG.name}`;
  const description =
    "Discover in-depth engineering posts, tutorials, and community perspectives on Chronicle.";
  const canonicalUrl = resolved.tag
    ? `/explore?tag=${encodeURIComponent(resolved.tag)}`
    : "/explore";

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: isSearching
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: `${siteUrl}${canonicalUrl}`,
      siteName: SITE_CONFIG.name,
      title,
      description,
      images: [
        {
          url: `${siteUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams.page) || 1;
  const query = resolvedParams.q || "";
  const activeTag = resolvedParams.tag || "";
  const activeSort = resolvedParams.sort || "recent";

  const [postsResponse, tagsList] = await Promise.all([
    getPublicPosts({
      page: currentPage,
      limit: 9,
      q: query,
      tag: activeTag,
      sort: activeSort,
    }),
    getPublicTags(),
  ]);

  const posts = postsResponse.data || [];
  const totalPages = postsResponse.pagination?.totalPages || 1;

  function createFilterUrl(newPage: number, newTag?: string, newSort?: string, newQ?: string) {
    const params = new URLSearchParams();
    if (newPage > 1) params.set("page", String(newPage));
    const tagVal = newTag !== undefined ? newTag : activeTag;
    if (tagVal) params.set("tag", tagVal);
    const sortVal = newSort !== undefined ? newSort : activeSort;
    if (sortVal && sortVal !== "recent") params.set("sort", sortVal);
    const qVal = newQ !== undefined ? newQ : query;
    if (qVal) params.set("q", qVal);

    const qs = params.toString();
    return `/explore${qs ? `?${qs}` : ""}`;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Explore Articles
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Discover in-depth engineering posts, tutorials, and community perspectives.
          </p>
        </div>

        {/* Search Bar with 300ms Debounce & Progressive Enhancement */}
        <ExploreSearchInput
          initialQuery={query}
          activeTag={activeTag}
          activeSort={activeSort}
        />
      </div>

      {/* Tag Chips Filter Bar */}
      {tagsList.length > 0 && (
        <div className="mb-8 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4 dark:border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Topics:
          </span>
          <Link href={createFilterUrl(1, "")}>
            <Badge
              variant={!activeTag ? "primary" : "secondary"}
              className="cursor-pointer hover:opacity-80"
            >
              All Topics
            </Badge>
          </Link>
          {tagsList.map((tag) => (
            <Link key={tag.id} href={createFilterUrl(1, tag.name)}>
              <Badge
                variant={activeTag === tag.name ? "primary" : "secondary"}
                className="cursor-pointer hover:opacity-80"
              >
                <span
                  className="inline-block max-w-[140px] truncate align-bottom"
                  title={`#${tag.name}`}
                >
                  #{tag.name}
                </span>
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {/* Feed Content */}
      {posts.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-6 w-6 text-slate-400" />}
          title="No articles found"
          description={
            query || activeTag
              ? "We couldn't find any articles matching your search criteria. Try clearing filters."
              : "No public articles have been published yet."
          }
          action={
            query || activeTag ? (
              <Link href="/explore">
                <Button variant="secondary" size="sm">
                  Clear Filters
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const displayDate = post.publishedAt || post.createdAt;
              return (
                <Card
                  key={post.id}
                  className="flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <div>
                    {/* Author Byline */}
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <Link
                        href={`/u/${post.authorId}`}
                        className="flex items-center gap-2 hover:underline"
                      >
                        <Avatar name={post.authorName || "Author"} size="xs" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {post.authorName || "Anonymous"}
                        </span>
                      </Link>
                      <span>{calculateReadingTime(post.content)}</span>
                    </div>

                    {/* Post Content & Title */}
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

                  {/* Tags & Date footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {post.tags?.slice(0, 2).map((t) => (
                          <Link key={t.id} href={createFilterUrl(1, t.name)}>
                            <Badge variant="neutral" className="hover:opacity-80">
                              <span
                                className="inline-block max-w-[100px] truncate align-bottom"
                                title={`#${t.name}`}
                              >
                                #{t.name}
                              </span>
                            </Badge>
                          </Link>
                        ))}
                      </div>
                      <time
                        dateTime={displayDate}
                        className="text-[11px] text-slate-400"
                        title={new Date(displayDate).toLocaleDateString()}
                      >
                        {formatRelativeTime(displayDate)}
                      </time>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                createPageUrl={(p) => createFilterUrl(p)}
              />
            </div>
          )}
        </div>
      )}
    </main>
  );
}
