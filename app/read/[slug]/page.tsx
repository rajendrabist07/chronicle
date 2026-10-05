import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPublicPostBySlug,
  getPublicPostComments,
  calculateReadingTime,
} from "../../lib/public";
import { SITE_CONFIG } from "../../lib/site";
import JsonLd from "../../components/seo/JsonLd";
import ArticleReaderView from "../../components/reading/ArticleReaderView";

interface ReadPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ReadPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const excerpt = post.content.slice(0, 160).replace(/\s+/g, " ").trim();
  const canonicalUrl = `/read/${post.slug || post.id}`;

  return {
    title: post.title,
    description: excerpt,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "article",
      siteName: SITE_CONFIG.name,
      locale: "en_US",
      title: post.title,
      description: excerpt,
      publishedTime: post.publishedAt || post.createdAt,
      authors: [post.authorName || SITE_CONFIG.name],
      tags: post.tags?.map((t) => t.name),
      url: canonicalUrl,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: excerpt,
      images: ["/og-image.png"],
      ...(SITE_CONFIG.twitterHandle ? { creator: SITE_CONFIG.twitterHandle } : {}),
    },
  };
}

export default async function ReadPostPage({ params }: ReadPageProps) {
  const { slug } = await params;
  const post = await getPublicPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const comments = await getPublicPostComments(slug);
  const readingTime = calculateReadingTime(post.content);
  const postUrl = `${SITE_CONFIG.url}/read/${post.slug || post.id}`;

  // Structured Data (JSON-LD)
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.content.slice(0, 160).trim(),
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.createdAt,
    author: {
      "@type": "Person",
      name: post.authorName || "Chronicle Author",
      url: `${SITE_CONFIG.url}/u/${post.authorId}`,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_CONFIG.url}/icon.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    keywords: post.tags?.map((t) => t.name).join(", "),
  };

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
        name: "Explore",
        item: `${SITE_CONFIG.url}/explore`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: postUrl,
      },
    ],
  };

  return (
    <main>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />

      <ArticleReaderView
        post={post}
        comments={comments}
        readingTime={readingTime}
        postUrl={postUrl}
      />
    </main>
  );
}
