import { apiFetch } from './api';
import type { Post, PaginatedResponse, ApiSuccessResponse } from '../types';
import type { CreatePostInput } from './validation';

export async function fetchPosts(token: string) {
    const res = await apiFetch<PaginatedResponse<Post>>('/posts', { token });
    return res;
}

export async function fetchPostById(id: string, token: string) {
    const res = await apiFetch<import('../types').ApiSuccessResponse<Post>>(`/posts/${id}`, { token });
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
