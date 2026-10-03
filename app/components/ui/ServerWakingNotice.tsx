"use client";

import { useEffect, useState } from "react";
import { Server } from "lucide-react";

interface ServerWakingNoticeProps {
  isLoading: boolean;
  delayMs?: number;
  className?: string;
}

export default function ServerWakingNotice({
  isLoading,
  delayMs = 4000,
  className = "",
}: ServerWakingNoticeProps) {
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShowNotice(false);
      return;
    }

    const timer = setTimeout(() => {
      if (isLoading) {
        setShowNotice(true);
      }
    }, delayMs);

    return () => clearTimeout(timer);
  }, [isLoading, delayMs]);

  if (!showNotice || !isLoading) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`mx-auto my-4 flex max-w-md items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/80 p-3.5 text-xs text-blue-900 shadow-xs backdrop-blur-xs transition-opacity animate-in fade-in dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200 ${className}`}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/60">
        <Server className="h-4 w-4 text-blue-600 animate-pulse dark:text-blue-400" />
      </div>
      <div>
        <p className="font-semibold">Waking up backend server</p>
        <p className="mt-0.5 text-blue-700 dark:text-blue-300">
          The free-tier hosting instance spins down when idle. Initial wake-up can take 30–50 seconds.
        </p>
      </div>
    </div>
  );
}
