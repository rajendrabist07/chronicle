"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerSchema, type RegisterInput } from "../lib/validation";
import { register, saveTokens } from "../lib/auth";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import ErrorAlert from "../components/ui/ErrorAlert";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState<RegisterInput>({
    email: "",
    password: "",
    name: "",
    organizationName: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterInput, string>>
  >({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(field: keyof RegisterInput, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegisterInput, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof RegisterInput;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await register(result.data);
      saveTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      router.push("/posts");
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Registration failed",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          Create an account
        </h1>

        {serverError && <ErrorAlert message={serverError} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="name"
            label="Name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            error={errors.name}
          />

          <Input
            id="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            error={errors.email}
          />

          <Input
            id="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            error={errors.password}
          />

          <Input
            id="organizationName"
            label="Organization / Company Name"
            type="text"
            value={formData.organizationName}
            onChange={(e) => handleChange("organizationName", e.target.value)}
            placeholder="e.g. Acme Inc"
            error={errors.organizationName}
          />

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Creating account..." : "Register"}
          </Button>
        </form>
      </div>
    </main>
  );
}
