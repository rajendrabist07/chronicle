"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { getAccessToken } from "../../lib/auth";
import { toggleLike, toggleBookmark } from "../../lib/posts";
import { describeApiError } from "../../lib/errors";
import { useToast } from "../ui/Toast";
import Button from "../ui/Button";
import { Heart, Bookmark, Share2, MessageSquare } from "lucide-react";

interface ArticleActionBarProps {
  postId: string;
  slug?: string;
  initialLikes?: number;
  initialLiked?: boolean;
  initialBookmarked?: boolean;
  commentsCount?: number;
  className?: string;
}

export default function ArticleActionBar({
  postId,
  initialLikes = 0,
  initialLiked = false,
  initialBookmarked = false,
  commentsCount,
  className = "",
}: ArticleActionBarProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { success, error, info } = useToast();

  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [likeLoading, setLikeLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  async function handleLike() {
    if (!user) {
      info("Please sign in to like this post");
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    const token = getAccessToken();
    if (!token) return;

    // Optimistic update
    const prevLiked = liked;
    const prevCount = likeCount;
    const nextLiked = !prevLiked;
    const nextCount = nextLiked ? prevCount + 1 : Math.max(0, prevCount - 1);

    setLiked(nextLiked);
    setLikeCount(nextCount);
    setLikeLoading(true);

    try {
      const res = await toggleLike(postId, token);
      if (typeof res?.liked === "boolean") {
        setLiked(res.liked);
      }
      if (typeof res?.likeCount === "number") {
        setLikeCount(res.likeCount);
      }
    } catch (err: any) {
      // Rollback
      setLiked(prevLiked);
      setLikeCount(prevCount);
      error(describeApiError(err));
    } finally {
      setLikeLoading(false);
    }
  }

  async function handleBookmark() {
    if (!user) {
      info("Please sign in to save bookmarks");
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    const token = getAccessToken();
    if (!token) return;

    // Optimistic update
    const prevBookmarked = bookmarked;
    const nextBookmarked = !prevBookmarked;

    setBookmarked(nextBookmarked);
    setBookmarkLoading(true);

    try {
      const res = await toggleBookmark(postId, token);
      if (typeof res?.bookmarked === "boolean") {
        setBookmarked(res.bookmarked);
      }
      if (nextBookmarked) {
        success("Saved to your bookmarks");
      } else {
        info("Removed from bookmarks");
      }
    } catch (err: any) {
      // Rollback
      setBookmarked(prevBookmarked);
      error(describeApiError(err));
    } finally {
      setBookmarkLoading(false);
    }
  }

  function handleShare() {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    success("Article link copied to clipboard!");
  }

  function scrollToComments() {
    const el = document.getElementById("discussion-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <div
      className={`flex items-center justify-between border-y border-slate-200 py-3 dark:border-slate-800 ${className}`}
    >
      <div className="flex items-center gap-2">
        {/* Like Button */}
        <button
          type="button"
          onClick={handleLike}
          disabled={likeLoading}
          aria-label={liked ? "Unlike article" : "Like article"}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
            liked
              ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          <Heart
            className={`h-4 w-4 transition-transform ${
              liked ? "fill-rose-500 text-rose-500 scale-110" : ""
            }`}
          />
          <span>{likeCount > 0 ? likeCount : "Like"}</span>
        </button>

        {/* Comment Count / Jump */}
        {commentsCount !== undefined && (
          <button
            type="button"
            onClick={scrollToComments}
            aria-label="Jump to discussion"
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <MessageSquare className="h-4 w-4" />
            <span>{commentsCount}</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Bookmark Button */}
        <button
          type="button"
          onClick={handleBookmark}
          disabled={bookmarkLoading}
          aria-label={bookmarked ? "Remove bookmark" : "Save bookmark"}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
            bookmarked
              ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          <Bookmark
            className={`h-4 w-4 transition-transform ${
              bookmarked ? "fill-blue-600 text-blue-600" : ""
            }`}
          />
          <span className="hidden sm:inline">
            {bookmarked ? "Saved" : "Save"}
          </span>
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          aria-label="Share article"
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>
    </div>
  );
}
