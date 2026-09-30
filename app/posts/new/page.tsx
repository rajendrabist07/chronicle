"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPostSchema, type CreatePostInput } from "../../lib/validation";
import { createPost } from "../../lib/posts";
import { getAccessToken } from "../../lib/auth";
import { createTag, attachTagsToPost } from "../../lib/tags";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
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

  function handleChange(field: keyof CreatePostInput, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
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
            // Tag पहिल्यै existing छ भने, silently skip
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

        <Textarea
          id="content"
          label="Content"
          rows={10}
          value={formData.content}
          onChange={(e) => handleChange("content", e.target.value)}
          error={errors.content}
        />

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
