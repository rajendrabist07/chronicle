import { apiFetch } from './api';
import type { User, ApiSuccessResponse } from '../types';

export interface UpdateProfileInput {
    name?: string;
    bio?: string;
}

export async function updateProfile(input: UpdateProfileInput, token: string) {
    const res = await apiFetch<ApiSuccessResponse<User>>('/users/me', {
        method: 'PATCH',
        token,
        body: JSON.stringify(input),
    });
    return res.data;
}

export async function fetchUserProfile(userId: string) {
    const res = await apiFetch<ApiSuccessResponse<User>>(`/users/${userId}`);
    return res.data;
}
