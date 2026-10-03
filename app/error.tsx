"use client";

import { useEffect } from "react";
import Link from "next/link";
import Card from "./components/ui/Card";
import Button from "./components/ui/Button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md bg-white p-8 text-center shadow-md">
        <h1 className="text-3xl font-bold text-gray-900">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Button onClick={() => reset()} className="w-full">
            Try again
          </Button>
          <Link href="/">
            <Button variant="secondary" className="w-full">
              Go home
            </Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
