"use client";

import { useState, useEffect, useCallback } from "react";
import RequireAuth from "../components/auth/RequireAuth";
import { getAccessToken } from "../lib/auth";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../lib/notifications";
import type { Notification } from "../types";
import { formatRelativeTime } from "../lib/time";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import Pagination from "../components/ui/Pagination";
import Skeleton from "../components/ui/Skeleton";
import { useToast } from "../components/ui/Toast";
import {
  Bell,
  CheckCheck,
  Heart,
  MessageSquare,
  Sparkles,
  Info,
} from "lucide-react";

export default function NotificationsPage() {
  return (
    <RequireAuth>
      <NotificationsContent />
    </RequireAuth>
  );
}

function NotificationsContent() {
  const { success, error } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterUnread, setFilterUnread] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = useCallback(
    async (currentPage = page, unread = filterUnread) => {
      const token = getAccessToken();
      if (!token) return;
      try {
        setLoading(true);
        const res = await fetchNotifications(token, currentPage, 15, unread);
        setNotifications(res.data);
        setTotalPages(res.pagination.totalPages);
        setTotalCount(res.pagination.total);
      } catch (err: any) {
        error(err.message || "Failed to load notifications");
      } finally {
        setLoading(false);
      }
    },
    [page, filterUnread, error]
  );

  useEffect(() => {
    loadNotifications(page, filterUnread);
  }, [page, filterUnread, loadNotifications]);

  async function handleMarkAsRead(id: string) {
    const token = getAccessToken();
    if (!token) return;
    try {
      await markNotificationAsRead(id, token);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      // silently ignore
    }
  }

  async function handleMarkAllAsRead() {
    const token = getAccessToken();
    if (!token) return;
    try {
      setMarkingAll(true);
      await markAllNotificationsAsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      success("All notifications marked as read");
    } catch (err: any) {
      error(err.message || "Failed to mark all as read");
    } finally {
      setMarkingAll(false);
    }
  }

  function getNotificationIcon(type: string) {
    switch (type.toUpperCase()) {
      case "LIKE":
        return <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />;
      case "COMMENT":
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case "AI":
      case "SYSTEM":
        return <Sparkles className="h-5 w-5 text-amber-500" />;
      default:
        return <Info className="h-5 w-5 text-slate-500" />;
    }
  }

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Stay updated on interactions with your articles and comments.
          </p>
        </div>

        {hasUnread && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleMarkAllAsRead}
            loading={markingAll}
            className="self-start sm:self-auto"
          >
            <CheckCheck className="mr-1.5 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
        <button
          type="button"
          onClick={() => {
            setFilterUnread(false);
            setPage(1);
          }}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            !filterUnread
              ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => {
            setFilterUnread(true);
            setPage(1);
          }}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            filterUnread
              ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          Unread only
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-8 w-8 text-slate-400" />}
          title={filterUnread ? "No unread notifications" : "No notifications yet"}
          description={
            filterUnread
              ? "You are all caught up! Switch to 'All' to view your notification history."
              : "When someone likes, comments, or interacts with your posts, you will see it here."
          }
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => {
                if (!notification.read) {
                  handleMarkAsRead(notification.id);
                }
              }}
              className={`group flex items-start justify-between gap-4 rounded-xl border p-4 transition-all duration-150 cursor-pointer ${
                notification.read
                  ? "border-slate-200/80 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
                  : "border-blue-200 bg-blue-50/50 hover:bg-blue-50 dark:border-blue-900/60 dark:bg-blue-950/20 dark:hover:bg-blue-950/30"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-xs dark:bg-slate-800">
                  {getNotificationIcon(notification.type)}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {notification.message}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {formatRelativeTime(notification.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex flex-shrink-0 items-center gap-2">
                {!notification.read && (
                  <Badge variant="primary">
                    New
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
}
