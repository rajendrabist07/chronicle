"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { createComment, type Comment } from "../../lib/comments";
import { getAccessToken } from "../../lib/auth";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import Textarea from "../ui/Textarea";
import Card from "../ui/Card";
import ErrorAlert from "../ui/ErrorAlert";
import { useToast } from "../ui/Toast";
import { MessageSquare, LogIn } from "lucide-react";

interface PublicPostCommentsProps {
  postId: string;
  initialComments: Comment[];
}

export default function PublicPostComments({
  postId,
  initialComments,
}: PublicPostCommentsProps) {
  const { user } = useAuth();
  const toast = useToast();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    const token = getAccessToken();
    if (!token) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const newComment = await createComment(postId, { content }, token);
      setComments((prev) => [newComment, ...prev]);
      setContent("");
      toast.success("Comment posted successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-12 border-t border-slate-200 pt-10 dark:border-slate-800">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Discussion ({comments.length})
        </h2>
      </div>

      {/* Authenticated user comment form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8 space-y-3">
          {error && <ErrorAlert message={error} />}
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your perspective or ask a question..."
            rows={3}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              loading={isSubmitting}
              size="sm"
            >
              Post Comment
            </Button>
          </div>
        </form>
      ) : (
        <Card className="mb-8 flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/60">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Sign in to join the conversation and leave a reply.
          </p>
          <Link href={`/login`}>
            <Button variant="secondary" size="sm">
              <LogIn className="h-3.5 w-3.5" />
              <span>Log In</span>
            </Button>
          </Link>
        </Card>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No comments yet. Be the first to start the discussion!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar name={comment.authorName || "User"} size="xs" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {comment.authorName || "Anonymous"}
                  </span>
                </div>
                <time
                  dateTime={comment.createdAt}
                  className="text-[11px] text-slate-400"
                >
                  {new Date(comment.createdAt).toLocaleDateString()}
                </time>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap pl-8">
                {comment.content}
              </p>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
