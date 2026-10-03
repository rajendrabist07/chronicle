"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Logo from "./brand/Logo";
import Avatar from "./ui/Avatar";
import DropdownMenu from "./ui/DropdownMenu";
import ThemeToggle from "./ui/ThemeToggle";
import Button from "./ui/Button";
import {
  Menu,
  X,
  Compass,
  FileText,
  PlusCircle,
  Bookmark,
  Settings,
  LogOut,
  Bell,
  User as UserIcon,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const navLinks = [
    { href: "/explore", label: "Explore", icon: <Compass className="h-4 w-4" /> },
    ...(user
      ? [
          { href: "/posts", label: "My Posts", icon: <FileText className="h-4 w-4" /> },
          { href: "/posts/new", label: "Write", icon: <PlusCircle className="h-4 w-4" /> },
        ]
      : []),
  ];

  return (
    <>
      {/* Accessible Skip to main content link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-md focus:outline-none"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-colors dark:border-slate-800/80 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Logo />
            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-1 md:flex" aria-label="Main Navigation">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-slate-100 text-blue-600 dark:bg-slate-900 dark:text-blue-400"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <ThemeToggle />

            {user ? (
              <>
                {/* Notification Bell Icon */}
                <Link
                  href="/notifications"
                  className="relative flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                </Link>

                {/* User Dropdown */}
                <div className="hidden sm:block">
                  <DropdownMenu
                    trigger={
                      <div className="flex items-center gap-2 rounded-full p-0.5 transition-transform hover:scale-105">
                        <Avatar name={user.name || user.email} size="sm" />
                      </div>
                    }
                    items={[
                      {
                        label: user.name || "My Account",
                        icon: <UserIcon className="h-4 w-4" />,
                        disabled: true,
                      },
                      "divider",
                      {
                        label: "My Posts",
                        href: "/posts",
                        icon: <FileText className="h-4 w-4" />,
                      },
                      {
                        label: "Bookmarks",
                        href: "/bookmarks",
                        icon: <Bookmark className="h-4 w-4" />,
                      },
                      {
                        label: "Settings",
                        href: "/settings",
                        icon: <Settings className="h-4 w-4" />,
                      },
                      "divider",
                      {
                        label: "Log out",
                        icon: <LogOut className="h-4 w-4" />,
                        danger: true,
                        onClick: handleLogout,
                      },
                    ]}
                  />
                </div>
              </>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu toggle button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:hidden dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 pt-3 pb-5 shadow-lg md:hidden dark:border-slate-800 dark:bg-slate-950">
            <nav className="flex flex-col gap-1.5" aria-label="Mobile Navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}

              {user ? (
                <>
                  <div className="my-2 border-t border-slate-100 dark:border-slate-800" />
                  <Link
                    href="/bookmarks"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                  >
                    <Bookmark className="h-4 w-4" />
                    <span>Bookmarks</span>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out ({user.name || user.email})</span>
                  </button>
                </>
              ) : (
                <div className="mt-3 flex flex-col gap-2 pt-2">
                  <Link href="/login" className="w-full">
                    <Button variant="secondary" className="w-full">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/register" className="w-full">
                    <Button className="w-full">Register</Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
