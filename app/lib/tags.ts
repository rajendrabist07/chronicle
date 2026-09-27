import { apiFetch } from './api';
import type { ApiSuccessResponse } from '../types';

export interface Tag {
    id: string;
    name: string;
}

export async function fetchTags(token: string) {
    const res = await apiFetch<ApiSuccessResponse<Tag[]>>('/tags', { token });
    return res.data;
}

export async function createTag(name: string, token: string) {
    const res = await apiFetch<ApiSuccessResponse<Tag>>('/tags', {
        method: 'POST',
        body: JSON.stringify({ name }),
        token,
    });
    return res.data;
}

export async function attachTagsToPost(postId: string, tagIds: string[], token: string) {
    const res = await apiFetch<ApiSuccessResponse<Tag[]>>(`/posts/${postId}/tags`, {
        method: 'POST',
        body: JSON.stringify({ tagIds }),
        token,
    });
    return res.data;
}