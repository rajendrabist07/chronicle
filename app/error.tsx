"use client";

import { useEffect } from "react";
import Link from "next/link";
import Card from "./components/ui/Card";
import Button from "./components/ui/Button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Keep developer-visible log
    console.error("Application runtime error:", error);
  }, [error]);

  // Clean user-facing message (do not expose raw DB or internals)
  const isNetworkOrTimeout =
    error.message?.toLowerCase().includes("network") ||
    error.message?.toLowerCase().includes("timed out") ||
    error.message?.toLowerCase().includes("fetch");

  const displayMessage = isNetworkOrTimeout
    ? "We are having trouble connecting to the server. It may be waking up or temporarily unavailable."
    : "Something went wrong on our side. Please try refreshing or return home.";

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8 text-center shadow-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </div>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Temporarily Unavailable
        </h1>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {displayMessage}
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Button onClick={() => reset()} className="w-full">
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </Button>

          <Link href="/">
            <Button variant="secondary" className="w-full">
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
