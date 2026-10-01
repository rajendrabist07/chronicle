"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import {
  fetchPostById,
  updatePost,
  deletePost,
  publishPost,
} from "../../lib/posts";
import { fetchComments, createComment, type Comment } from "../../lib/comments";
import { getAccessToken } from "../../lib/auth";
import type { Post } from "../../types";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import ErrorAlert from "../../components/ui/ErrorAlert";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isLoading: authLoading, user } = useAuth();
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

  async function handleSaveEdit() {
    const token = getAccessToken();
    if (!token || !post) return;

    setIsSaving(true);
    setActionError(null);
    try {
      const updated = await updatePost(
        post.id,
        { title: editTitle, content: editContent },
        token,
      );
      setPost(updated);
      setIsEditing(false);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to update post",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    const token = getAccessToken();
    if (!token || !post) return;

    const confirmed = window.confirm(
      "Delete this post? This cannot be undone.",
    );
    if (!confirmed) return;

    setIsDeleting(true);
    setActionError(null);
    try {
      await deletePost(post.id, token);
      router.push("/posts");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to delete post",
      );
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
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to publish post",
      );
    } finally {
      setIsPublishing(false);
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

  const isAuthor = user?.id === post.authorId;
  const isPrivileged = user?.role === "ADMIN" || user?.role === "OWNER";
  const canModify = isAuthor || isPrivileged;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {actionError && <ErrorAlert message={actionError} />}

      <article className="border-b border-gray-200 pb-6">
        {isEditing ? (
          <div className="space-y-4">
            <Input
              id="editTitle"
              label="Title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <Textarea
              id="editContent"
              label="Content"
              rows={8}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
            <div className="flex gap-3">
              <Button onClick={handleSaveEdit} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
              {canModify && (
                <div className="flex gap-2">
                  {post.status === "DRAFT" && (
                    <Button onClick={handlePublish} disabled={isPublishing}>
                      {isPublishing ? "Publishing..." : "Publish"}
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {post.status} · {new Date(post.createdAt).toLocaleDateString()}
            </p>
            <p className="mt-4 whitespace-pre-wrap text-gray-700">
              {post.content}
            </p>

            {post.tags && post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag.id}>{tag.name}</Badge>
                ))}
              </div>
            )}
          </>
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
