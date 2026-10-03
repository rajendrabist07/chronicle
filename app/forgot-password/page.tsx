"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPasswordSchema, type ForgotPasswordInput } from "../lib/validation";
import { forgotPassword } from "../lib/auth";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import Logo from "../components/brand/Logo";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.issues[0]?.message || "Invalid email");
      return;
    }

    setIsSubmitting(true);
    try {
      await forgotPassword(email.trim());
    } catch {
      // Neutral anti-enumeration pattern: do not expose whether email exists
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8 shadow-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo size="md" />
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Reset your password
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Enter your account email to receive a password reset link.
          </p>
        </div>

        {isSubmitted ? (
          <div className="space-y-4 text-center animate-in fade-in">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              If an account matches <span className="font-semibold text-slate-900 dark:text-white">{email}</span>, a secure password reset link has been dispatched to your inbox.
            </p>
            <div className="pt-4">
              <Link href="/login">
                <Button variant="secondary" className="w-full">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              label="Account Email Address"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="you@example.com"
              error={error || undefined}
            />

            <Button
              type="submit"
              disabled={isSubmitting || !email.trim()}
              loading={isSubmitting}
              className="w-full"
            >
              <Mail className="h-4 w-4" />
              <span>Send Reset Link</span>
            </Button>

            <div className="pt-2 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </Card>
    </main>
  );
}
