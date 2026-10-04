"use client";

import { useState } from "react";
import Link from "next/link";
import { registerSchema, type RegisterInput } from "../lib/validation";
import { register, resendVerificationEmail, saveTokens } from "../lib/auth";
import { evaluatePasswordStrength } from "../lib/passwordStrength";
import { describeApiError } from "../lib/errors";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import ErrorAlert from "../components/ui/ErrorAlert";
import Logo from "../components/brand/Logo";
import { Eye, EyeOff, MailCheck, CheckCircle, RefreshCw } from "lucide-react";

export default function RegisterPage() {
  const { setUser } = useAuth();

  const [formData, setFormData] = useState<RegisterInput>({
    email: "",
    password: "",
    name: "",
    organizationName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterInput, string>>
  >({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success / Verification pending state
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const passwordStrength = evaluatePasswordStrength(formData.password);

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
      setRegisteredEmail(formData.email);
    } catch (err) {
      setServerError(describeApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (!registeredEmail || resendCooldown > 0) return;
    setIsResending(true);
    setResendMessage(null);
    try {
      await resendVerificationEmail(registeredEmail);
      setResendMessage("Verification email resent. Please check your inbox and spam folder.");
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setResendMessage(describeApiError(err));
    } finally {
      setIsResending(false);
    }
  }

  if (registeredEmail) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md p-8 text-center shadow-md">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <MailCheck className="h-7 w-7" />
          </div>

          <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Check your email
          </h1>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            We sent a verification link to <span className="font-semibold text-slate-900 dark:text-white">{registeredEmail}</span>.
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Click the link in the email to activate your account and begin publishing.
          </p>

          {resendMessage && (
            <div className="mt-4 rounded-lg bg-blue-50 p-3 text-xs text-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
              {resendMessage}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3">
            <Button
              variant="secondary"
              onClick={handleResend}
              disabled={isResending || resendCooldown > 0}
              loading={isResending}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4" />
              <span>
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend Verification Email"}
              </span>
            </Button>

            <Link href="/posts">
              <Button className="w-full">Go to My Workspace</Button>
            </Link>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8 shadow-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo size="md" />
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Create an account
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Join the Chronicle community to write and collaborate.
          </p>
        </div>

        {serverError && <ErrorAlert message={serverError} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="name"
            label="Full Name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Jane Doe"
            error={errors.name}
          />

          <Input
            id="email"
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="jane@example.com"
            error={errors.email}
          />

          <div>
            <div className="relative">
              <Input
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="At least 8 characters"
                error={errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-8.5 text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:text-slate-200"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Password strength meter bar */}
            {formData.password && (
              <div className="mt-2 space-y-1.5" aria-live="polite">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    Strength:
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${passwordStrength.percentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <Input
            id="organizationName"
            label="Organization / Team Name"
            type="text"
            value={formData.organizationName}
            onChange={(e) => handleChange("organizationName", e.target.value)}
            placeholder="Acme Corp"
            error={errors.organizationName}
          />

          <Button
            type="submit"
            disabled={isSubmitting}
            loading={isSubmitting}
            className="w-full mt-2"
          >
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            Log in
          </Link>
        </p>
      </Card>
    </main>
  );
}
