"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPostSchema, type CreatePostInput } from "../../lib/validation";
import { createPost } from "../../lib/posts";
import { getAccessToken } from "../../lib/auth";
import { createTag, attachTagsToPost } from "../../lib/tags";
import MarkdownEditor from "../../components/editor/MarkdownEditor";
import AIAssistantPanel from "../../components/ai/AIAssistantPanel";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import ErrorAlert from "../../components/ui/ErrorAlert";
import RequireAuth from "../../components/auth/RequireAuth";
import { useToast } from "../../components/ui/Toast";

export default function NewPostPage() {
  return (
    <RequireAuth>
      <NewPostContent />
    </RequireAuth>
  );
}

function NewPostContent() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [tagsInput, setTagsInput] = useState("");
  const [formData, setFormData] = useState<CreatePostInput>({
    title: "",
    content: "",
    status: "DRAFT",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreatePostInput, string>>
  >({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(field: keyof CreatePostInput, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleApplyTitle(newTitle: string) {
    handleChange("title", newTitle);
    success("Suggested title applied!");
  }

  function handleApplyTags(suggestedTags: string[]) {
    const existingTags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const merged = Array.from(new Set([...existingTags, ...suggestedTags])).join(", ");
    setTagsInput(merged);
    success("Suggested tags added!");
  }

  function handleApplyContent(newContent: string) {
    handleChange("content", newContent);
    success("Content updated!");
  }

  function handleAppendContent(additional: string) {
    handleChange("content", formData.content ? `${formData.content}\n\n${additional}` : additional);
    success("Outline appended to content!");
  }

  async function handleSubmit(
    e: React.FormEvent,
    submitStatus: "DRAFT" | "PUBLISHED"
  ) {
    e.preventDefault();
    setServerError(null);

    const payload = { ...formData, status: submitStatus };
    const result = createPostSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof CreatePostInput, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof CreatePostInput;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    const token = getAccessToken();
    if (!token) {
      router.push("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      const post = await createPost(result.data, token);

      // Clear draft autosave
      localStorage.removeItem("chronicle_draft_new");

      if (tagsInput.trim()) {
        const tagNames = tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
        const tagIds: string[] = [];
        for (const name of tagNames) {
          try {
            const tag = await createTag(name, token);
            tagIds.push(tag.id);
          } catch {
            // Tag already exists; skip creation
          }
        }
        if (tagIds.length > 0) {
          await attachTagsToPost(post.id, tagIds, token);
        }
      }

      success(submitStatus === "PUBLISHED" ? "Article published!" : "Draft saved!");
      router.push(`/posts/${post.id}`);
    } catch (err: any) {
      const msg = err?.message || "Failed to create post";
      setServerError(msg);
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Write New Story
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Compose your article using full Markdown formatting and AI assistance.
          </p>
        </div>
      </div>

      {serverError && <ErrorAlert message={serverError} />}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Editor Form - 2 Cols on Large screens */}
        <form className="space-y-6 lg:col-span-2">
          <Input
            id="title"
            label="Title"
            type="text"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            error={errors.title}
            placeholder="Enter an intriguing title..."
            required
          />

          <MarkdownEditor
            id="content"
            label="Story Content"
            value={formData.content}
            onChange={(val) => handleChange("content", val)}
            error={errors.content}
            placeholder="Start drafting your article... Use ## headings, code blocks, lists, etc."
            rows={14}
            draftKey="new"
          />

          <Input
            id="tags"
            label="Tags (comma-separated, optional)"
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="nextjs, react, architecture"
          />

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              loading={isSubmitting}
              disabled={isSubmitting}
              onClick={(e) => handleSubmit(e, "DRAFT")}
              className="flex-1"
            >
              Save as Draft
            </Button>
            <Button
              type="button"
              loading={isSubmitting}
              disabled={isSubmitting}
              onClick={(e) => handleSubmit(e, "PUBLISHED")}
              className="flex-1"
            >
              Publish Now
            </Button>
          </div>
        </form>

        {/* AI Assistant Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <AIAssistantPanel
              content={formData.content}
              onApplyTitle={handleApplyTitle}
              onApplyTags={handleApplyTags}
              onApplyContent={handleApplyContent}
              onAppendContent={handleAppendContent}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
