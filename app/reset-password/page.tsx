"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPasswordSchema } from "../lib/validation";
import { resetPassword } from "../lib/auth";
import { evaluatePasswordStrength } from "../lib/passwordStrength";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import ErrorAlert from "../components/ui/ErrorAlert";
import Logo from "../components/brand/Logo";
import { useToast } from "../components/ui/Toast";
import { Eye, EyeOff, Lock } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const toast = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(
    token ? null : "Password reset token is missing from the URL.",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordStrength = evaluatePasswordStrength(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const result = resetPasswordSchema.safeParse({ password });
    if (!result.success) {
      setError(result.error.issues[0]?.message || "Invalid password");
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(token, password);
      toast.success("Password updated successfully! Please sign in with your new password.");
      router.push("/login");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to reset password. The link may have expired.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8 shadow-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo size="md" />
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Set a new password
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Create a strong, unique password for your account.
          </p>
        </div>

        {error && <ErrorAlert message={error} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <Input
                id="password"
                label="New Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
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

            {/* Password strength bar */}
            {password && (
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
            id="confirmPassword"
            label="Confirm New Password"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat your new password"
          />

          <Button
            type="submit"
            disabled={isSubmitting || !token || !password}
            loading={isSubmitting}
            className="w-full"
          >
            <Lock className="h-4 w-4" />
            <span>Update Password</span>
          </Button>

          <div className="pt-2 text-center">
            <Link
              href="/login"
              className="text-xs font-medium text-slate-500 hover:underline dark:text-slate-400"
            >
              Cancel and return to Sign In
            </Link>
          </div>
        </form>
      </Card>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          Loading...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
