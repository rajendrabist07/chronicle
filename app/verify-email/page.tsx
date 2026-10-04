"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { verifyEmail, resendVerificationEmail } from "../lib/auth";
import { describeApiError } from "../lib/errors";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import Logo from "../components/brand/Logo";
import { CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    token ? "verifying" : "error",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(
    token ? null : "Verification token is missing from the URL.",
  );
  const [emailInput, setEmailInput] = useState("");
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  // Prevent double-execution in React strict mode
  const verifiedRef = useRef(false);

  useEffect(() => {
    if (!token || verifiedRef.current) return;
    verifiedRef.current = true;

    verifyEmail(token)
      .then(() => {
        setStatus("success");
      })
      .catch((err) => {
        setStatus("error");
        setErrorMessage(describeApiError(err));
      });
  }, [token]);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setIsResending(true);
    setResendStatus(null);
    try {
      await resendVerificationEmail(emailInput.trim());
      setResendStatus("Verification email sent. Please check your inbox.");
    } catch (err) {
      setResendStatus(describeApiError(err));
    } finally {
      setIsResending(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8 text-center shadow-md">
        <div className="mb-6 flex justify-center">
          <Logo size="md" />
        </div>

        {status === "verifying" && (
          <div className="py-8 space-y-4">
            <Spinner message="Verifying your email address..." />
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Email Verified!
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Your email address has been successfully confirmed. You can now publish articles and participate in discussions.
            </p>
            <div className="pt-4">
              <Link href="/login">
                <Button className="w-full">
                  <span>Sign In to Your Workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Verification Failed
            </h1>
            <p className="text-sm text-red-600 dark:text-red-400">
              {errorMessage}
            </p>

            <div className="mt-6 border-t border-slate-100 pt-6 text-left dark:border-slate-800">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Request a new verification link
              </h2>
              <form onSubmit={handleResend} className="mt-3 space-y-3">
                <input
                  type="email"
                  placeholder="Enter your registered email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
                {resendStatus && (
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {resendStatus}
                  </p>
                )}
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  disabled={isResending || !emailInput.trim()}
                  loading={isResending}
                  className="w-full"
                >
                  Resend Link
                </Button>
              </form>
            </div>
          </div>
        )}
      </Card>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          Loading...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
