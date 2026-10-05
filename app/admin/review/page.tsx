"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAccessToken } from "../../lib/auth";
import {
  getModerationQueue,
  approvePost,
  rejectPost,
  unpublishPost,
  updateReportStatus,
  setUserTrustLevel,
  suspendUser,
  restoreUser,
  getAuditLogs,
  type AuditLogItem,
} from "../../lib/admin";
import type { Post } from "../../types";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import { TrustLevelBadge } from "../../components/trust/TrustBadge";
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  FileText,
  AlertTriangle,
  UserCheck,
  UserX,
  History,
  Clock,
  Eye,
} from "lucide-react";
import Link from "next/link";

export default function AdminReviewPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"queue" | "reports" | "trust" | "audit">("queue");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Queue State
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [reports, setReports] = useState<any[]>([]);

  // Audit State
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  // Action Modals
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Trust Management State
  const [targetUserId, setTargetUserId] = useState("");
  const [selectedTrustLevel, setSelectedTrustLevel] = useState<"CONTRIBUTOR" | "VERIFIED" | "AUTHORITY">("VERIFIED");
  const [trustSuccessMessage, setTrustSuccessMessage] = useState<string | null>(null);

  async function loadData() {
    const token = getAccessToken();
    if (!token) return;

    setIsLoading(true);
    setError(null);
    try {
      if (activeTab === "queue" || activeTab === "reports") {
        const queueRes = await getModerationQueue(token, 1, 20);
        if (queueRes?.data) {
          const qData = queueRes.data as any;
          if (Array.isArray(qData)) {
            setPendingPosts(qData);
          } else {
            setPendingPosts(qData.posts || []);
            setReports(qData.reports || []);
          }
        } else if (Array.isArray(queueRes)) {
          setPendingPosts(queueRes as any);
        }
      } else if (activeTab === "audit") {
        const auditRes = await getAuditLogs(token, { limit: 20 });
        if (auditRes?.data) {
          setAuditLogs(Array.isArray(auditRes.data) ? auditRes.data : []);
        } else if (Array.isArray(auditRes)) {
          setAuditLogs(auditRes);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load moderation data");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!isAuthLoading && user) {
      loadData();
    }
  }, [activeTab, isAuthLoading, user]);

  async function handleApprove(postId: string) {
    const token = getAccessToken();
    if (!token) return;

    setIsSubmittingAction(true);
    try {
      await approvePost(postId, token);
      setPendingPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err: any) {
      alert(err.message || "Failed to approve post");
    } finally {
      setIsSubmittingAction(false);
    }
  }

  async function handleRejectSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPostId || !rejectReason.trim()) return;

    const token = getAccessToken();
    if (!token) return;

    setIsSubmittingAction(true);
    try {
      await rejectPost(selectedPostId, rejectReason.trim(), token);
      setPendingPosts((prev) => prev.filter((p) => p.id !== selectedPostId));
      setRejectModalOpen(false);
      setRejectReason("");
      setSelectedPostId(null);
    } catch (err: any) {
      alert(err.message || "Failed to reject post");
    } finally {
      setIsSubmittingAction(false);
    }
  }

  async function handleResolveReport(reportId: string, status: "RESOLVED" | "DISMISSED") {
    const token = getAccessToken();
    if (!token) return;

    const notes = prompt("Enter resolution notes:", `Marked as ${status.toLowerCase()} by reviewer`);
    if (notes === null) return;

    try {
      await updateReportStatus(reportId, status, notes, token);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (err: any) {
      alert(err.message || "Failed to update report status");
    }
  }

  async function handleSetTrustLevel(e: React.FormEvent) {
    e.preventDefault();
    if (!targetUserId.trim()) return;

    const token = getAccessToken();
    if (!token) return;

    setIsSubmittingAction(true);
    setTrustSuccessMessage(null);
    try {
      await setUserTrustLevel(targetUserId.trim(), selectedTrustLevel, token);
      setTrustSuccessMessage(`Trust level updated to ${selectedTrustLevel} for user.`);
      setTargetUserId("");
    } catch (err: any) {
      alert(err.message || "Failed to update trust level");
    } finally {
      setIsSubmittingAction(false);
    }
  }

  if (isAuthLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner message="Checking reviewer credentials..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center px-4">
        <ShieldAlert className="mx-auto h-12 w-12 text-amber-600 mb-4" />
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Authentication Required</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 mb-6">
          Please sign in to access the Chronicle review & trust desk.
        </p>
        <Link href="/login">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Trust & Moderation Desk
            </h1>
            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              Admin / Reviewer
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Review submissions, enforce high-signal publishing standards, and audit security events.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("queue")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === "queue"
              ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Review Queue</span>
          {pendingPosts.length > 0 && (
            <span className="rounded-full bg-blue-100 px-2 py-0.2 text-xs font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-200">
              {pendingPosts.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === "reports"
              ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Content Reports</span>
          {reports.length > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-0.2 text-xs font-bold text-red-700 dark:bg-red-900 dark:text-red-200">
              {reports.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("trust")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === "trust"
              ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <UserCheck className="h-4 w-4" />
          <span>Trust & Reputation</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === "audit"
              ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <History className="h-4 w-4" />
          <span>Audit Log</span>
        </button>
      </div>

      {/* Tab Content */}
      {isLoading ? (
        <div className="py-16 text-center">
          <Spinner message="Loading desk items..." />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/60 dark:bg-red-950/50">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-600 dark:text-red-400 mb-2" />
          <p className="text-sm font-semibold text-red-800 dark:text-red-300">{error}</p>
          <Button onClick={loadData} variant="secondary" size="sm" className="mt-4">
            Retry
          </Button>
        </div>
      ) : activeTab === "queue" ? (
        <div>
          {pendingPosts.length === 0 ? (
            <EmptyState
              title="Review queue is clear"
              description="No articles currently pending peer moderation or automated trust validation."
              icon={<CheckCircle className="h-10 w-10 text-emerald-500" />}
            />
          ) : (
            <div className="space-y-4">
              {pendingPosts.map((post) => (
                <Card key={post.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        PENDING REVIEW
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                        {post.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {post.content.slice(0, 180)}...
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <span>Submitted by <strong>{post.authorName || "Author"}</strong></span>
                      <span>•</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                    <Link href={`/read/${post.slug || post.id}`} target="_blank">
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        <span>Preview</span>
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedPostId(post.id);
                        setRejectModalOpen(true);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(post.id)}
                      disabled={isSubmittingAction}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Approve & Publish
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === "reports" ? (
        <div>
          {reports.length === 0 ? (
            <EmptyState
              title="No open reports"
              description="No user reports currently require moderation action."
              icon={<CheckCircle className="h-10 w-10 text-emerald-500" />}
            />
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <Card key={report.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-950 dark:text-red-300">
                        {report.targetType} REPORT
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Reason: {report.reason}
                      </h3>
                    </div>
                    {report.details && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        &ldquo;{report.details}&rdquo;
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400 pt-1">
                      Reported on {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleResolveReport(report.id, "DISMISSED")}
                    >
                      Dismiss
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleResolveReport(report.id, "RESOLVED")}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Mark Resolved
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === "trust" ? (
        <Card className="p-6 max-w-xl">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Assign Author Trust Level
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
            Upgrade recognized community contributors to Verified Engineers or Domain Authorities.
          </p>

          <form onSubmit={handleSetTrustLevel} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                User ID
              </label>
              <input
                type="text"
                placeholder="e.g. cmuv6r64x0005jk2riuefh43u"
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Trust Level
              </label>
              <select
                value={selectedTrustLevel}
                onChange={(e) => setSelectedTrustLevel(e.target.value as any)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="CONTRIBUTOR">Contributor (Default verified community writer)</option>
                <option value="VERIFIED">Verified Engineer (Identity and technical credibility confirmed)</option>
                <option value="AUTHORITY">Domain Authority (Recognized expert / high-signal author)</option>
              </select>
            </div>

            {trustSuccessMessage && (
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                ✓ {trustSuccessMessage}
              </p>
            )}

            <Button type="submit" loading={isSubmittingAction} disabled={!targetUserId.trim() || isSubmittingAction}>
              Update Trust Level
            </Button>
          </form>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Security & Audit Trail</h2>
            <p className="text-xs text-slate-500">Immutable record of system security events and reviewer actions</p>
          </div>

          {auditLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">No audit logs recorded yet.</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white mr-2">
                      {log.action}
                    </span>
                    <span className="text-slate-500">
                      Resource: {log.resource}
                    </span>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      User: {log.userId} {log.ipAddress && `• IP: ${log.ipAddress}`}
                    </div>
                  </div>
                  <span className="text-slate-400 shrink-0">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Post & Request Revisions"
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4 pt-2">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Please provide a specific, actionable reason for requesting revisions from the author.
          </p>
          <textarea
            rows={3}
            placeholder="e.g. Please ground claims in Section 2 with code examples or cite sources..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            required
            className="w-full rounded-md border border-slate-300 p-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setRejectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              loading={isSubmittingAction}
              disabled={!rejectReason.trim() || isSubmittingAction}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Confirm Rejection
            </Button>
          </div>
        </form>
      </Modal>
    </main>
  );
}
