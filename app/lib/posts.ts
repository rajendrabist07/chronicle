import { apiFetch } from './api';
import type { Post, PaginatedResponse, ApiSuccessResponse } from '../types';
import type { CreatePostInput } from './validation';

export async function fetchPosts(
    token: string,
    page = 1,
    limit = 10,
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
) {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });
    if (status) {
        params.set('status', status);
    }
    const res = await apiFetch<PaginatedResponse<Post>>(
        `/posts?${params.toString()}`,
        { token },
    );
    return res;
}

export async function fetchPostById(id: string, token: string) {
    const res = await apiFetch<ApiSuccessResponse<Post>>(`/posts/${id}`, { token });
    return res.data;
}

export async function createPost(input: CreatePostInput, token: string) {
    const res = await apiFetch<ApiSuccessResponse<Post>>('/posts', {
        method: 'POST',
        token,
        body: JSON.stringify(input),
    });
    return res.data;
}

export async function updatePost(
    id: string,
    input: { title?: string; content?: string },
    token: string
) {
    const res = await apiFetch<ApiSuccessResponse<Post>>(`/posts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
        token,
    });
    return res.data;
}

export async function deletePost(id: string, token: string) {
    await apiFetch<void>(`/posts/${id}`, {
        method: 'DELETE',
        token,
    });
}

export async function publishPost(id: string, token: string) {
    const res = await apiFetch<ApiSuccessResponse<Post>>(`/posts/${id}/publish`, {
        method: 'PATCH',
        token,
    });
    return res.data;
}