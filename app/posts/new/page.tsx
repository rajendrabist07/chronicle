"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPostSchema, type CreatePostInput } from "../../lib/validation";
import { createPost } from "../../lib/posts";
import { getAccessToken } from "../../lib/auth";

export default function NewPostPage() {
  const router = useRouter();

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

      {serverError && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <form className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700"
          >
            Content
          </label>
          <textarea
            id="content"
            rows={10}
            value={formData.content}
            onChange={(e) => handleChange("content", e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content}</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={(e) => handleSubmit(e, "DRAFT")}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save as Draft"}
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={(e) => handleSubmit(e, "PUBLISHED")}
            className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Publishing..." : "Publish"}
          </button>
        </div>
      </form>
    </main>
  );
}
