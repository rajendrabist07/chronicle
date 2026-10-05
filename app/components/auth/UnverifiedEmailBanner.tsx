"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { resendVerificationEmail } from "../../lib/auth";
import Link from "next/link";
import { AlertTriangle, X, RefreshCw } from "lucide-react";

export default function UnverifiedEmailBanner() {
  const { user } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // If unauthenticated or already verified or dismissed
  if (!user || user.emailVerified || isDismissed) {
    return null;
  }

  async function handleResend() {
    if (!user?.email || cooldown > 0) return;
    setIsResending(true);
    setStatusMessage(null);
    try {
      await resendVerificationEmail(user.email);
      setStatusMessage("Verification email dispatched!");
      setCooldown(60);
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setStatusMessage("Failed to resend. Please try again later.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <aside
      aria-label="Email Verification Notice"
      className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-900 transition-colors dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-200"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            Please verify your email address (<strong>{user.email}</strong>) to publish articles and participate in discussions.{" "}
            <Link href="/verify-email" className="font-semibold underline underline-offset-2 hover:text-amber-950 dark:hover:text-white">
              Enter verification code
            </Link>
          </span>
          {statusMessage && (
            <span className="font-semibold text-amber-700 dark:text-amber-300">
              · {statusMessage}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || cooldown > 0}
            className="inline-flex items-center gap-1 rounded bg-amber-100 px-2.5 py-1 font-semibold text-amber-800 hover:bg-amber-200 disabled:opacity-50 dark:bg-amber-900/60 dark:text-amber-200 dark:hover:bg-amber-800"
          >
            <RefreshCw className={`h-3 w-3 ${isResending ? "animate-spin" : ""}`} />
            <span>{cooldown > 0 ? `Resend (${cooldown}s)` : "Resend Link"}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss verification banner"
            className="rounded p-1 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
