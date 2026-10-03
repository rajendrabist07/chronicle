"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { useAuth } from "../../context/AuthContext";
import {
  fetchPostById,
  updatePost,
  deletePost,
  publishPost,
} from "../../lib/posts";
import {
  fetchComments,
  createComment,
  updateComment,
  deleteComment,
  type Comment,
} from "../../lib/comments";
import { getAccessToken } from "../../lib/auth";
import type { Post } from "../../types";
import { formatRelativeTime } from "../../lib/time";
import { calculateReadingTime } from "../../lib/public";
import MarkdownEditor from "../../components/editor/MarkdownEditor";
import AIAssistantPanel from "../../components/ai/AIAssistantPanel";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";
import ErrorAlert from "../../components/ui/ErrorAlert";
import { useToast } from "../../components/ui/Toast";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Send,
  User,
  ExternalLink,
} from "lucide-react";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isLoading: authLoading, user } = useAuth();
  const { success, error: toastError, info } = useToast();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Comment edit state
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [isSavingComment, setIsSavingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

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
        setEditTitle(postData.title);
        setEditContent(postData.content);
        setComments(commentsData);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load post")
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
        { content: newComment.trim() },
        token
      );
      setComments((prev) => [comment, ...prev]);
      setNewComment("");
      success("Comment posted!");
    } catch (err: any) {
      toastError(err?.message || "Failed to post comment");
    } finally {
      setIsSubmittingComment(false);
    }
  }

  async function handleSaveEdit() {
    const token = getAccessToken();
    if (!token || !post) return;

    setIsSaving(true);
    setActionError(null);
    try {
      const updated = await updatePost(
        post.id,
        { title: editTitle, content: editContent },
        token
      );
      setPost(updated);
      setIsEditing(false);
      success("Post updated successfully!");
    } catch (err: any) {
      const msg = err?.message || "Failed to update post";
      setActionError(msg);
      toastError(msg);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    const token = getAccessToken();
    if (!token || !post) return;

    const confirmed = window.confirm("Delete this post? This cannot be undone.");
    if (!confirmed) return;

    setIsDeleting(true);
    setActionError(null);
    try {
      await deletePost(post.id, token);
      info("Post deleted");
      router.push("/posts");
    } catch (err: any) {
      const msg = err?.message || "Failed to delete post";
      setActionError(msg);
      toastError(msg);
      setIsDeleting(false);
    }
  }

  async function handlePublish() {
    const token = getAccessToken();
    if (!token || !post) return;

    setIsPublishing(true);
    setActionError(null);
    try {
      const updated = await publishPost(post.id, token);
      setPost(updated);
      success("Post published successfully!");
    } catch (err: any) {
      const msg = err?.message || "Failed to publish post";
      setActionError(msg);
      toastError(msg);
    } finally {
      setIsPublishing(false);
    }
  }

  function startEditComment(comment: Comment) {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.content);
  }

  function cancelEditComment() {
    setEditingCommentId(null);
    setEditCommentText("");
  }

  async function handleSaveCommentEdit(commentId: string) {
    const token = getAccessToken();
    if (!token || !editCommentText.trim()) return;

    setIsSavingComment(true);
    try {
      const updated = await updateComment(
        postId,
        commentId,
        editCommentText.trim(),
        token
      );
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? updated : c))
      );
      setEditingCommentId(null);
      setEditCommentText("");
      success("Comment updated!");
    } catch (err: any) {
      toastError(err?.message || "Failed to update comment");
    } finally {
      setIsSavingComment(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    const token = getAccessToken();
    if (!token) return;

    const confirmed = window.confirm("Delete this comment?");
    if (!confirmed) return;

    setDeletingCommentId(commentId);
    try {
      await deleteComment(postId, commentId, token);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      info("Comment deleted");
    } catch (err: any) {
      toastError(err?.message || "Failed to delete comment");
    } finally {
      setDeletingCommentId(null);
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Spinner message="Loading post... First request may take a moment while server warms up." />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-red-600 dark:text-red-400">{error || "Post not found"}</p>
        <Link href="/posts" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          Return to My Posts
        </Link>
      </div>
    );
  }

  const isAuthor = user?.id === post.authorId;
  const isPrivileged = user?.role === "ADMIN" || user?.role === "OWNER";
  const canModify = isAuthor || isPrivileged;
  const readingTime = calculateReadingTime(post.content);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Back button */}
      <Link
        href="/posts"
        className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to My Posts</span>
      </Link>

      {actionError && <ErrorAlert message={actionError} />}

      <article className="border-b border-slate-200 pb-8 dark:border-slate-800">
        {isEditing ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <Input
                id="editTitle"
                label="Title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />

              <MarkdownEditor
                id="editContent"
                label="Content"
                rows={12}
                value={editContent}
                onChange={(val) => setEditContent(val)}
                draftKey={`post_${post.id}`}
              />

              <div className="flex gap-3 pt-2">
                <Button onClick={handleSaveEdit} loading={isSaving}>
                  Save Changes
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setEditTitle(post.title);
                    setEditContent(post.content);
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            </div>

            {/* AI Assistant in edit mode */}
            <div className="lg:col-span-1">
              <AIAssistantPanel
                content={editContent}
                onApplyTitle={(t) => setEditTitle(t)}
                onApplyTags={() => {}}
                onApplyContent={(c) => setEditContent(c)}
                onAppendContent={(a) => setEditContent(`${editContent}\n\n${a}`)}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Header / Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      post.status === "PUBLISHED"
                        ? "success"
                        : post.status === "DRAFT"
                        ? "warning"
                        : "secondary"
                    }
                  >
                    {post.status}
                  </Badge>
                  {post.slug && post.status === "PUBLISHED" && (
                    <Link
                      href={`/read/${post.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                    >
                      <span>View Public Story</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                  {post.title}
                </h1>
              </div>

              {canModify && (
                <div className="flex flex-wrap items-center gap-2">
                  {post.status === "DRAFT" && (
                    <Button
                      size="sm"
                      onClick={handlePublish}
                      loading={isPublishing}
                    >
                      <Send className="mr-1.5 h-3.5 w-3.5" />
                      Publish
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleDelete}
                    loading={isDeleting}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              )}
            </div>

            {/* Author and Date Meta */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {post.authorName || "Author"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {readingTime}
              </span>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <Badge key={tag.id} variant="neutral">
                    #{tag.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Rendered Markdown Body */}
            <div className="prose prose-slate mt-6 max-w-none dark:prose-invert prose-headings:font-bold prose-pre:bg-slate-900 text-slate-800 dark:text-slate-200">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </>
        )}
      </article>

      {/* Internal Post Comments */}
      <section className="mt-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Comments ({comments.length})
        </h2>

        <form onSubmit={handleCommentSubmit} className="mt-4 space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              loading={isSubmittingComment}
              disabled={isSubmittingComment || !newComment.trim()}
            >
              Post Comment
            </Button>
          </div>
        </form>

        <ul className="mt-6 space-y-3">
          {comments.map((comment) => {
            const canModifyComment =
              comment.authorId === user?.id || isPrivileged;
            const isEditingThis = editingCommentId === comment.id;

            return (
              <li key={comment.id}>
                <Card className="p-4">
                  {isEditingThis ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editCommentText}
                        onChange={(e) => setEditCommentText(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveCommentEdit(comment.id)}
                          loading={isSavingComment}
                          disabled={isSavingComment || !editCommentText.trim()}
                        >
                          Save
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={cancelEditComment}
                          disabled={isSavingComment}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          {comment.authorName && (
                            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                              {comment.authorName}
                            </p>
                          )}
                          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                            {comment.content}
                          </p>
                        </div>
                        {canModifyComment && (
                          <div className="flex shrink-0 gap-2">
                            <button
                              onClick={() => startEditComment(comment)}
                              className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              disabled={deletingCommentId === comment.id}
                              className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
                            >
                              {deletingCommentId === comment.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="mt-2 text-[11px] text-slate-400">
                        {formatRelativeTime(comment.createdAt)}
                      </p>
                    </>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
