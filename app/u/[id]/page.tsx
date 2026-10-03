import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicUser, getPublicPosts, calculateReadingTime } from "../../lib/public";
import { SITE_CONFIG } from "../../lib/site";
import Avatar from "../../components/ui/Avatar";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import JsonLd from "../../components/seo/JsonLd";
import { ArrowLeft, Calendar, FileText } from "lucide-react";

interface UserProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: UserProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const user = await getPublicUser(id);

  if (!user) {
    return {
      title: "Author Not Found",
    };
  }

  return {
    title: `${user.name} — Author Profile`,
    description: user.bio || `Explore published articles and stories by ${user.name} on ${SITE_CONFIG.name}.`,
    alternates: {
      canonical: `/u/${encodeURIComponent(id)}`,
    },
    openGraph: {
      title: `${user.name} — Author Profile on ${SITE_CONFIG.name}`,
      description: user.bio || `Read articles written by ${user.name}.`,
    },
  };
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { id } = await params;
  const user = await getPublicUser(id);

  if (!user) {
    notFound();
  }

  // Fetch author posts
  const postsResponse = await getPublicPosts({ limit: 20 });
  const authorPosts = (postsResponse.data || []).filter((p) => p.authorId === id);
  const userUrl = `${SITE_CONFIG.url}/u/${encodeURIComponent(id)}`;

  const profileSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: user.name,
      description: user.bio || undefined,
      url: userUrl,
    },
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <JsonLd data={profileSchema} />

      <Link
        href="/explore"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Explore</span>
      </Link>

      {/* Author Bio Header Card */}
      <Card className="mb-10 p-6 sm:p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <Avatar name={user.name} size="xl" />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              {user.name}
            </h1>
            {user.bio ? (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {user.bio}
              </p>
            ) : (
              <p className="mt-2 text-xs italic text-slate-400">
                Author at Chronicle
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 sm:justify-start dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  Joined{" "}
                  {new Date(user.createdAt).toLocaleDateString(undefined, {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                <span>{authorPosts.length} published {authorPosts.length === 1 ? "story" : "stories"}</span>
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Published Stories Section */}
      <section>
        <h2 className="mb-6 text-xl font-bold text-slate-900 dark:text-white">
          Published Articles
        </h2>

        {authorPosts.length === 0 ? (
          <EmptyState
            title="No published stories yet"
            description={`${user.name} hasn't published any public stories yet.`}
          />
        ) : (
          <div className="space-y-4">
            {authorPosts.map((post) => (
              <Card
                key={post.id}
                className="transition-all hover:border-blue-300 dark:hover:border-blue-900/60"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <Link
                      href={`/read/${post.slug || post.id}`}
                      className="group"
                    >
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                        {post.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-600 line-clamp-2 dark:text-slate-300">
                        {post.content}
                      </p>
                    </Link>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">
                    {calculateReadingTime(post.content)}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                  <div className="flex flex-wrap gap-1">
                    {post.tags?.map((t) => (
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
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
