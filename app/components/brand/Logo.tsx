import Link from "next/link";
import { SITE_CONFIG } from "../../lib/site";

export default function Logo({
  showWordmark = true,
  className = "",
  size = "md",
}: {
  showWordmark?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeMap = {
    sm: { icon: "h-6 w-6", text: "text-base", sub: "text-xs" },
    md: { icon: "h-8 w-8", text: "text-lg", sub: "text-xs" },
    lg: { icon: "h-10 w-10", text: "text-xl", sub: "text-sm" },
  };

  const currentSize = sizeMap[size];

  return (
    <Link
      href="/"
      className={`group flex items-center gap-2.5 font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md ${className}`}
      aria-label={`${SITE_CONFIG.name} home`}
    >
      <div
        className={`relative flex items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 p-1.5 text-white shadow-sm transition-transform group-hover:scale-105 ${currentSize.icon}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-full w-full"
          aria-hidden="true"
        >
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
          <path d="M6 6h10" />
          <path d="M6 10h10" />
          <path d="M6 14h6" />
        </svg>
      </div>

      {showWordmark && (
        <span
          className={`font-semibold tracking-tight text-slate-900 dark:text-white ${currentSize.text}`}
        >
          {SITE_CONFIG.name}
        </span>
      )}
    </Link>
  );
}
