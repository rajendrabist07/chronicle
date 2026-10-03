"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPostSchema, type CreatePostInput } from "../../lib/validation";
import { createPost } from "../../lib/posts";
import { getAccessToken } from "../../lib/auth";
import { createTag, attachTagsToPost } from "../../lib/tags";
import { suggestContent, type AiSuggestions } from "../../lib/ai";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import ErrorAlert from "../../components/ui/ErrorAlert";

export default function NewPostPage() {
  const router = useRouter();
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

  // AI suggestions state
  const [suggestions, setSuggestions] = useState<AiSuggestions | null>(null);
  const [isGettingSuggestions, setIsGettingSuggestions] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  function handleChange(field: keyof CreatePostInput, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleGetAiSuggestions() {
    if (formData.content.trim().length < 20) return;

    const token = getAccessToken();
    if (!token) {
      router.push("/login");
      return;
    }

    setAiError(null);
    setIsGettingSuggestions(true);

    try {
      const data = await suggestContent(formData.content, token);
      setSuggestions(data);
    } catch (err) {
      setAiError(
        err instanceof Error ? err.message : "Failed to get AI suggestions",
      );
    } finally {
      setIsGettingSuggestions(false);
    }
  }

  function handleUseTags() {
    if (!suggestions?.tags) return;
    const existingTags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const merged = Array.from(
      new Set([...existingTags, ...suggestions.tags]),
    ).join(", ");
    setTagsInput(merged);
  }

  async function handleSubmit(
    e: React.FormEvent,
    submitStatus: "DRAFT" | "PUBLISHED",
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

      router.push(`/posts/${post.id}`);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Failed to create post",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">New Post</h1>

      {serverError && <ErrorAlert message={serverError} />}

      <form className="space-y-4">
        <Input
          id="title"
          label="Title"
          type="text"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          error={errors.title}
        />

        <div>
          <Textarea
            id="content"
            label="Content"
            rows={10}
            value={formData.content}
            onChange={(e) => handleChange("content", e.target.value)}
            error={errors.content}
          />
          <div className="mt-2 flex justify-end">
            <Button
              type="button"
              variant="secondary"
              disabled={
                isGettingSuggestions || formData.content.trim().length < 20
              }
              onClick={handleGetAiSuggestions}
              className="text-xs"
            >
              {isGettingSuggestions
                ? "✨ Generating suggestions..."
                : "✨ Get AI Suggestions"}
            </Button>
          </div>
        </div>

        {aiError && <ErrorAlert message={aiError} />}

        {suggestions && (
          <Card className="border-blue-200 bg-blue-50/40">
            <div className="mb-3 flex items-center justify-between border-b border-blue-100 pb-2">
              <span className="text-sm font-semibold text-blue-900">
                ✨ AI Suggestions
              </span>
              <button
                type="button"
                onClick={() => setSuggestions(null)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                ✕ Dismiss
              </button>
            </div>

            {suggestions.title && (
              <div className="mb-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-gray-500">
                    Suggested Title
                  </span>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleChange("title", suggestions.title)}
                    className="px-2 py-0.5 text-xs"
                  >
                    Use Title
                  </Button>
                </div>
                <p className="mt-1 text-sm font-medium text-gray-800">
                  {suggestions.title}
                </p>
              </div>
            )}

            {suggestions.summary && (
              <div className="mb-3">
                <span className="text-xs font-medium text-gray-500">
                  Summary
                </span>
                <p className="mt-1 text-xs italic text-gray-600">
                  {suggestions.summary}
                </p>
              </div>
            )}

            {suggestions.tags && suggestions.tags.length > 0 && (
              <div>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-gray-500">
                    Suggested Tags
                  </span>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleUseTags}
                    className="px-2 py-0.5 text-xs"
                  >
                    Use Tags
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        <Input
          id="tags"
          label="Tags (comma-separated, optional)"
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="javascript, tutorial, react"
        />

        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={isSubmitting}
            onClick={(e) => handleSubmit(e, "DRAFT")}
            className="flex-1"
          >
            {isSubmitting ? "Saving..." : "Save as Draft"}
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={(e) => handleSubmit(e, "PUBLISHED")}
            className="flex-1"
          >
            {isSubmitting ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </form>
    </main>
  );
}
