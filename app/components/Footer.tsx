"use client";

import Link from "next/link";
import Logo from "./brand/Logo";
import { SITE_CONFIG } from "../lib/site";
import { useAuth } from "../context/AuthContext";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <Logo size="sm" />
            <p className="max-w-xs text-center text-xs text-slate-500 sm:text-left dark:text-slate-400">
              {SITE_CONFIG.tagline}
            </p>
          </div>

          <nav
            aria-label="Footer Navigation"
            className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-600 dark:text-slate-400"
          >
            <Link href="/explore" className="hover:text-blue-600 dark:hover:text-blue-400">
              Explore
            </Link>
            {isAuthenticated && (
              <Link href="/posts" className="hover:text-blue-600 dark:hover:text-blue-400">
                My Posts
              </Link>
            )}
            <Link href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400">
              Terms of Service
            </Link>
          </nav>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-400 dark:border-slate-900 dark:text-slate-500">
          <p>© {currentYear} {SITE_CONFIG.name}. Built with Next.js, Tailwind CSS & {SITE_CONFIG.aiProvider}.</p>
        </div>
      </div>
    </footer>
  );
}
