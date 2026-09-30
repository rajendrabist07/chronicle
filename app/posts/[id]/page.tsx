"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { fetchPostById } from "../../lib/posts";
import { fetchComments, createComment, type Comment } from "../../lib/comments";
import { getAccessToken } from "../../lib/auth";
import type { Post } from "../../types";
import Button from "../../components/ui/Button";
import Textarea from "../../components/ui/Textarea";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isLoading: authLoading } = useAuth();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    const token = getAccessToken();
    if (!token) {
      router.push("/login");
      return;
    }

    Promise.all([fetchPostById(postId, token), fetchComments(postId, token)])
      .then(([postData, commentsData]) => {
        setPost(postData);
        setComments(commentsData);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load post"),
      )
      .finally(() => setIsLoading(false));
  }, [authLoading, postId, router]);

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = getAccessToken();
    if (!token || !newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const comment = await createComment(
        postId,
        { content: newComment },
        token,
      );
      setComments((prev) => [comment, ...prev]);
      setNewComment("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setIsSubmittingComment(false);
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-600">
        {error || "Post not found"}
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <article className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
        <p className="mt-2 text-sm text-gray-500">
          {post.status} · {new Date(post.createdAt).toLocaleDateString()}
        </p>
        <p className="mt-4 whitespace-pre-wrap text-gray-700">{post.content}</p>

        {post.tags && post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag.id}>{tag.name}</Badge>
            ))}
          </div>
        )}
      </article>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900">
          Comments ({comments.length})
        </h2>

        <form onSubmit={handleCommentSubmit} className="mt-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
          />
          <Button
            type="submit"
            disabled={isSubmittingComment || !newComment.trim()}
            className="mt-2"
          >
            {isSubmittingComment ? "Posting..." : "Post Comment"}
          </Button>
        </form>

        <ul className="mt-6 space-y-4">
          {comments.map((comment) => (
            <li key={comment.id}>
              <Card>
                <p className="text-sm text-gray-700">{comment.content}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
