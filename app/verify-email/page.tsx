"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { verifyEmail, resendVerificationEmail } from "../lib/auth";
import { useAuth } from "../context/AuthContext";
import { describeApiError } from "../lib/errors";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import Logo from "../components/brand/Logo";
import { CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const urlToken = searchParams.get("token");
  const { user, refreshUser } = useAuth();

  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">(
    urlToken ? "verifying" : "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState("");
  const [emailInput, setEmailInput] = useState(user?.email || "");
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [isManualSubmitting, setIsManualSubmitting] = useState(false);

  // Prevent double-execution in React strict mode
  const verifiedRef = useRef(false);

  async function executeVerification(tokenToVerify: string) {
    setStatus("verifying");
    setErrorMessage(null);
    try {
      await verifyEmail(tokenToVerify);
      setStatus("success");
      await refreshUser();
    } catch (err) {
      setStatus("error");
      setErrorMessage(describeApiError(err));
    }
  }

  useEffect(() => {
    if (!urlToken || verifiedRef.current) return;
    verifiedRef.current = true;
    executeVerification(urlToken);
  }, [urlToken]);

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualToken.trim()) return;
    setIsManualSubmitting(true);
    await executeVerification(manualToken.trim());
    setIsManualSubmitting(false);
  }

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setIsResending(true);
    setResendStatus(null);
    try {
      await resendVerificationEmail(emailInput.trim());
      setResendStatus("Verification email sent. Please check your inbox (and spam folder).");
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
              Your email address has been successfully confirmed. You now have full access to publish articles, comment, and participate in discussions.
            </p>
            <div className="pt-4">
              <Link href={user ? "/" : "/login"}>
                <Button className="w-full">
                  <span>{user ? "Continue to Chronicle" : "Sign In to Your Account"}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {(status === "idle" || status === "error") && (
          <div className="space-y-6 animate-in fade-in text-left">
            {status === "error" ? (
              <div className="text-center space-y-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Verification Failed
                </h1>
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errorMessage || "Invalid or expired verification token."}
                </p>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Verify Your Email
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Enter the verification token or code from your email to activate your account.
                </p>
              </div>
            )}

            {/* Manual Token Entry Form */}
            <form onSubmit={handleManualSubmit} className="space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
              <label htmlFor="token-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Verification Token / Code
              </label>
              <input
                id="token-input"
                type="text"
                placeholder="Paste your verification token here"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              <Button
                type="submit"
                size="md"
                disabled={isManualSubmitting || !manualToken.trim()}
                loading={isManualSubmitting}
                className="w-full"
              >
                Verify Code
              </Button>
            </form>

            {/* Resend Link Section */}
            <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Didn&apos;t receive the email?
              </h2>
              <form onSubmit={handleResend} className="mt-2 space-y-3">
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
                  Resend Verification Email
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
