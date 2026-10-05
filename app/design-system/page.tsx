"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import Select from "../components/ui/Select";
import Avatar from "../components/ui/Avatar";
import Card from "../components/ui/Card";
import Skeleton from "../components/ui/Skeleton";
import Spinner from "../components/ui/Spinner";
import Modal from "../components/ui/Modal";
import DropdownMenu from "../components/ui/DropdownMenu";
import Tabs from "../components/ui/Tabs";
import EmptyState from "../components/ui/EmptyState";
import Pagination from "../components/ui/Pagination";
import Tooltip from "../components/ui/Tooltip";
import ThemeToggle from "../components/ui/ThemeToggle";
import { ToastProvider, useToast } from "../components/ui/Toast";
import Logo from "../components/brand/Logo";
import { Sparkles, User, Settings, LogOut, Heart } from "lucide-react";

function DesignSystemContent() {
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(2);

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <Logo size="lg" />
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Design System & Component Library
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Interactive showcase of all design tokens, accessibility primitives, and UI components.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>

      <div className="space-y-12">
        {/* Buttons */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Buttons
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="outline">Outline</Button>
            <Button loading>Loading...</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button size="sm">Small (sm)</Button>
            <Button size="md">Medium (md)</Button>
            <Button size="lg">Large (lg)</Button>
          </div>
        </section>

        {/* Badges */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Badges
          </h2>
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge variant="default">Default / Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="neutral">Neutral</Badge>
          </div>
        </section>

        {/* Avatars */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Avatars (Deterministic Colors)
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <Avatar name="Alex Johnson" size="xs" />
            <Avatar name="Brenda Miller" size="sm" />
            <Avatar name="Carlos Santana" size="md" />
            <Avatar name="Devon Vance" size="lg" />
            <Avatar name="Elena Rostova" size="xl" />
          </div>
        </section>

        {/* Form Controls */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Form Controls
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Input
              id="ds-input"
              label="Standard Input"
              placeholder="e.g. hello@example.com"
            />
            <Input
              id="ds-input-error"
              label="Input with Error"
              value="invalid-email"
              readOnly
              error="Please enter a valid email address"
            />
            <Select
              id="ds-select"
              label="Select Dropdown"
              options={[
                { value: "tech", label: "Technology" },
                { value: "design", label: "Design" },
                { value: "ai", label: "Artificial Intelligence" },
              ]}
            />
            <Select
              id="ds-select-error"
              label="Select with Error"
              options={[{ value: "", label: "Choose an option..." }]}
              error="Selection is required"
            />
          </div>
          <Textarea
            id="ds-textarea"
            label="Textarea"
            placeholder="Write your thoughts..."
            rows={3}
          />
        </section>

        {/* Toast Notifications */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Toasts (Accessible Live Region)
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => toast.success("Post successfully published!", "Saved")}
            >
              Show Success Toast
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast.error("Could not reach the server.", "Network Error")}
            >
              Show Error Toast
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast.warning("Session expires in 5 minutes.", "Warning")}
            >
              Show Warning Toast
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast.info("New suggestions generated by AI.", "Notice")}
            >
              Show Info Toast
            </Button>
          </div>
        </section>

        {/* Modals & Dropdowns */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Overlays (Modal & DropdownMenu)
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <Button onClick={() => setIsModalOpen(true)}>
              Open Modal Dialog
            </Button>

            <DropdownMenu
              trigger={
                <Button variant="secondary">
                  User Menu Dropdown ▾
                </Button>
              }
              items={[
                { label: "Profile", icon: <User className="h-4 w-4" /> },
                { label: "Settings", icon: <Settings className="h-4 w-4" /> },
                "divider",
                {
                  label: "Logout",
                  icon: <LogOut className="h-4 w-4" />,
                  danger: true,
                  onClick: () => toast.info("Logged out"),
                },
              ]}
            />

            <Tooltip content="Saved to your bookmarks">
              <Button variant="ghost" className="border border-slate-200 dark:border-slate-800">
                Hover for Tooltip
              </Button>
            </Tooltip>
          </div>

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Publish Confirmation"
            description="Are you sure you want to publish this draft article to the public feed?"
          >
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Once published, it will be visible on the explore feed and indexed by search engines.
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setIsModalOpen(false);
                    toast.success("Post published successfully!");
                  }}
                >
                  Confirm & Publish
                </Button>
              </div>
            </div>
          </Modal>
        </section>

        {/* Tabs */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Accessible Tabs (WAI-ARIA Pattern)
          </h2>
          <Card>
            <Tabs
              tabs={[
                {
                  id: "write",
                  label: "Write",
                  icon: <Sparkles className="h-4 w-4" />,
                  content: (
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Write raw Markdown with instant formatting shortcuts and live word count.
                    </p>
                  ),
                },
                {
                  id: "preview",
                  label: "Preview",
                  icon: <Heart className="h-4 w-4" />,
                  content: (
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Sanitized, rich HTML preview rendering headings, code blocks, and blockquotes.
                    </p>
                  ),
                },
              ]}
            />
          </Card>
        </section>

        {/* Empty State & Pagination */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Empty State & Pagination
          </h2>
          <EmptyState
            title="No bookmarks yet"
            description="Explore articles and tap the bookmark icon to save them for reading later."
            action={<Button size="sm">Explore Articles</Button>}
          />
          <Pagination
            currentPage={page}
            totalPages={5}
            onPageChange={(p) => setPage(p)}
          />
        </section>

        {/* Spinners & Skeletons */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Loading & Skeletons
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Card className="flex items-center justify-center p-8">
              <Spinner message="Waking up server..." />
            </Card>
            <Card className="space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function DesignSystemPage() {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PUBLIC_ENABLE_DESIGN_SYSTEM !== "true"
  ) {
    notFound();
  }

  return (
    <ToastProvider>
      <DesignSystemContent />
    </ToastProvider>
  );
}
