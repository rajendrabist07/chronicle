"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { createComment, type Comment } from "../../lib/comments";
import { getAccessToken } from "../../lib/auth";
import { formatRelativeTime } from "../../lib/time";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import Textarea from "../ui/Textarea";
import Card from "../ui/Card";
import ErrorAlert from "../ui/ErrorAlert";
import { useToast } from "../ui/Toast";
import { MessageSquare, LogIn, Reply, CornerDownRight } from "lucide-react";

interface PublicPostCommentsProps {
  postId: string;
  initialComments: Comment[];
}

export default function PublicPostComments({
  postId,
  initialComments,
}: PublicPostCommentsProps) {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reply State
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    const token = getAccessToken();
    if (!token) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const newComment = await createComment(postId, { content: content.trim() }, token);
      setComments((prev) => [newComment, ...prev]);
      setContent("");
      success("Comment posted successfully!");
    } catch (err: any) {
      setError(err?.message || "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReplySubmit(parentId: string) {
    if (!replyContent.trim()) return;

    const token = getAccessToken();
    if (!token) return;

    setIsSubmittingReply(true);

    try {
      const newReply = await createComment(
        postId,
        { content: replyContent.trim(), parentId },
        token
      );
      setComments((prev) => {
        // If the backend returns parentId, we can nest it or append it
        return prev.map((c) => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: [...(c.replies || []), newReply],
            };
          }
          return c;
        });
      });
      setReplyContent("");
      setReplyingToId(null);
      success("Reply posted!");
    } catch (err: any) {
      toastError(err?.message || "Failed to post reply");
    } finally {
      setIsSubmittingReply(false);
    }
  }

  return (
    <section
      id="discussion-section"
      className="mt-12 border-t border-slate-200 pt-10 dark:border-slate-800"
    >
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
            placeholder="Share your perspective, insight, or question..."
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
            <div key={comment.id} className="space-y-3">
              <Card className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar name={comment.authorName || "User"} size="sm" />
                    <div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                        {comment.authorName || "Anonymous"}
                      </span>
                      <time
                        dateTime={comment.createdAt}
                        className="text-[11px] text-slate-400"
                      >
                        {formatRelativeTime(comment.createdAt)}
                      </time>
                    </div>
                  </div>

                  {user && (
                    <button
                      type="button"
                      onClick={() =>
                        setReplyingToId(
                          replyingToId === comment.id ? null : comment.id
                        )
                      }
                      className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                    >
                      <Reply className="h-3.5 w-3.5" />
                      <span>Reply</span>
                    </button>
                  )}
                </div>

                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap pl-9">
                  {comment.content}
                </p>

                {/* Inline Reply Form */}
                {replyingToId === comment.id && (
                  <div className="ml-9 mt-3 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <Textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={`Reply to ${comment.authorName || "comment"}...`}
                      rows={2}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setReplyingToId(null);
                          setReplyContent("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        loading={isSubmittingReply}
                        disabled={isSubmittingReply || !replyContent.trim()}
                        onClick={() => handleReplySubmit(comment.id)}
                      >
                        Post Reply
                      </Button>
                    </div>
                  </div>
                )}
              </Card>

              {/* Nested Replies Rendering */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-6 space-y-2 border-l-2 border-slate-200 pl-4 sm:ml-8 dark:border-slate-800">
                  {comment.replies.map((reply) => (
                    <Card
                      key={reply.id}
                      className="p-3.5 bg-slate-50/70 dark:bg-slate-900/40"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <CornerDownRight className="h-3.5 w-3.5 text-slate-400" />
                        <Avatar name={reply.authorName || "User"} size="xs" />
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {reply.authorName || "Anonymous"}
                        </span>
                        <time
                          dateTime={reply.createdAt}
                          className="text-[10px] text-slate-400"
                        >
                          {formatRelativeTime(reply.createdAt)}
                        </time>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap pl-5">
                        {reply.content}
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
