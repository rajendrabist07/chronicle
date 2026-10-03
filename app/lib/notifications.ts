import { apiFetch } from './api';
import type { Notification, PaginatedResponse, ApiSuccessResponse } from '../types';

export async function fetchNotifications(
    token: string,
    page = 1,
    limit = 20,
    unreadOnly = false
) {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });
    if (unreadOnly) {
        params.set('unreadOnly', 'true');
    }
    const res = await apiFetch<PaginatedResponse<Notification>>(
        `/notifications?${params.toString()}`,
        { token }
    );
    return res;
}

export async function fetchUnreadCount(token: string): Promise<number> {
    const res = await apiFetch<ApiSuccessResponse<{ unreadCount: number }>>(
        '/notifications/unread-count',
        { token }
    );
    return res.data.unreadCount;
}

export async function markNotificationAsRead(id: string, token: string) {
    const res = await apiFetch<ApiSuccessResponse<Notification>>(
        `/notifications/${id}/read`,
        {
            method: 'PATCH',
            token,
        }
    );
    return res.data;
}

export async function markAllNotificationsAsRead(token: string) {
    const res = await apiFetch<ApiSuccessResponse<{ message: string }>>(
        '/notifications/read-all',
        {
            method: 'PATCH',
            token,
        }
    );
    return res.data;
}
