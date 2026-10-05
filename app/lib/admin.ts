import { apiFetch } from './api';
import type { Post, PaginatedResponse, ApiSuccessResponse, User } from '../types';

export interface ModerationQueueItem {
  posts: Post[];
  reports: {
    id: string;
    targetType: string;
    targetId: string;
    reason: string;
    details?: string;
    reporterId: string;
    createdAt: string;
  }[];
}

export interface AuditLogItem {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export interface AuditLogQueryParams {
  action?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

/**
 * List pending posts and open reports in moderation queue.
 * GET /api/v1/admin/moderation/queue
 */
export async function getModerationQueue(
  token: string,
  page = 1,
  limit = 10
): Promise<PaginatedResponse<ModerationQueueItem>> {
  const res = await apiFetch<PaginatedResponse<ModerationQueueItem>>(
    `/admin/moderation/queue?page=${page}&limit=${limit}`,
    { token }
  );
  return res;
}

/**
 * Approve and publish a pending review post.
 * POST /api/v1/admin/posts/{id}/approve
 */
export async function approvePost(id: string, token: string): Promise<Post> {
  const res = await apiFetch<ApiSuccessResponse<Post>>(
    `/admin/posts/${id}/approve`,
    {
      method: 'POST',
      token,
    }
  );
  return res.data;
}

/**
 * Reject a pending post with reason.
 * POST /api/v1/admin/posts/{id}/reject
 */
export async function rejectPost(
  id: string,
  reason: string,
  token: string
): Promise<Post> {
  const res = await apiFetch<ApiSuccessResponse<Post>>(
    `/admin/posts/${id}/reject`,
    {
      method: 'POST',
      body: JSON.stringify({ reason }),
      token,
    }
  );
  return res.data;
}

/**
 * Unpublish a post back to DRAFT.
 * POST /api/v1/admin/posts/{id}/unpublish
 */
export async function unpublishPost(id: string, token: string): Promise<Post> {
  const res = await apiFetch<ApiSuccessResponse<Post>>(
    `/admin/posts/${id}/unpublish`,
    {
      method: 'POST',
      token,
    }
  );
  return res.data;
}

/**
 * Update / resolve a moderation report.
 * PATCH /api/v1/admin/reports/{id}
 */
export async function updateReportStatus(
  id: string,
  status: 'RESOLVED' | 'DISMISSED',
  resolutionNotes: string,
  token: string
) {
  const res = await apiFetch<ApiSuccessResponse<any>>(
    `/admin/reports/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status, resolutionNotes }),
      token,
    }
  );
  return res.data;
}

/**
 * Suspend user account and revoke sessions.
 * POST /api/v1/admin/users/{id}/suspend
 */
export async function suspendUser(id: string, token: string): Promise<User> {
  const res = await apiFetch<ApiSuccessResponse<User>>(
    `/admin/users/${id}/suspend`,
    {
      method: 'POST',
      token,
    }
  );
  return res.data;
}

/**
 * Restore a suspended user account to ACTIVE.
 * POST /api/v1/admin/users/{id}/restore
 */
export async function restoreUser(id: string, token: string): Promise<User> {
  const res = await apiFetch<ApiSuccessResponse<User>>(
    `/admin/users/${id}/restore`,
    {
      method: 'POST',
      token,
    }
  );
  return res.data;
}

/**
 * Update a user trust level.
 * POST /api/v1/admin/users/{id}/set-trust-level
 */
export async function setUserTrustLevel(
  id: string,
  trustLevel: 'CONTRIBUTOR' | 'VERIFIED' | 'AUTHORITY',
  token: string
): Promise<User> {
  const res = await apiFetch<ApiSuccessResponse<User>>(
    `/admin/users/${id}/set-trust-level`,
    {
      method: 'POST',
      body: JSON.stringify({ trustLevel }),
      token,
    }
  );
  return res.data;
}

/**
 * List security and lifecycle audit logs (OWNER or ADMIN only).
 * GET /api/v1/audit-logs
 */
export async function getAuditLogs(
  token: string,
  params: AuditLogQueryParams = {}
): Promise<PaginatedResponse<AuditLogItem>> {
  const searchParams = new URLSearchParams();
  if (params.action) searchParams.set('action', params.action);
  if (params.userId) searchParams.set('userId', params.userId);
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());

  const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
  const res = await apiFetch<PaginatedResponse<AuditLogItem>>(
    `/audit-logs${query}`,
    { token }
  );
  return res;
}
