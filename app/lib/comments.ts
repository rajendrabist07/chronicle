import { apiFetch } from './api';
import type { ApiSuccessResponse } from '../types';

export interface Comment {
    id: string;
    content: string;
    postId: string;
    authorId: string;
    authorName: string;
    parentId: string | null;
    createdAt: string;
    updatedAt: string;
    replies?: Comment[];
}

export async function fetchComments(postId: string, token: string) {
    const res = await apiFetch<ApiSuccessResponse<Comment[]>>(`/posts/${postId}/comments`, { token });
    return res.data;
}

export async function createComment(
    postId: string,
    input: { content: string; parentId?: string },
    token: string
) {
    const res = await apiFetch<ApiSuccessResponse<Comment>>(`/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify(input),
        token,
    });
    return res.data;
}

export async function updateComment(
    postId: string,
    commentId: string,
    content: string,
    token: string
) {
    const res = await apiFetch<ApiSuccessResponse<Comment>>(
        `/posts/${postId}/comments/${commentId}`,
        {
            method: 'PATCH',
            body: JSON.stringify({ content }),
            token,
        },
    );
    return res.data;
}

export async function deleteComment(postId: string, commentId: string, token: string) {
    await apiFetch<void>(`/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
        token,
    });
}