import { apiFetch } from './api';
import type { AuthResponse, ApiSuccessResponse } from '../types';
import type { RegisterInput } from './validation';

export async function register(input: RegisterInput) {
    const res = await apiFetch<ApiSuccessResponse<AuthResponse>>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(input),
    });
    return res.data;
}

export async function login(input: { email: string; password: string }) {
    const res = await apiFetch<ApiSuccessResponse<AuthResponse>>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(input),
    });
    return res.data;
}

export async function verifyEmail(token: string) {
    const res = await apiFetch<ApiSuccessResponse<{ message: string }>>('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token }),
    });
    return res.data;
}

export async function resendVerificationEmail(email: string) {
    const res = await apiFetch<ApiSuccessResponse<{ message: string }>>('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });
    return res.data;
}

export async function forgotPassword(email: string) {
    const res = await apiFetch<ApiSuccessResponse<{ message: string }>>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });
    return res.data;
}

export async function resetPassword(token: string, password: string) {
    const res = await apiFetch<ApiSuccessResponse<{ message: string }>>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
    });
    return res.data;
}

export async function changePassword(oldPassword: string, newPassword: string, token: string) {
    const res = await apiFetch<ApiSuccessResponse<{ message: string }>>('/auth/change-password', {
        method: 'POST',
        token,
        body: JSON.stringify({ oldPassword, newPassword }),
    });
    return res.data;
}

export function saveTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
}

export function getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
}

export function clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
}

export async function refreshAccessToken(refreshToken: string): Promise<string> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
        throw new Error('Refresh failed');
    }

    const data = await res.json();
    return data.data.accessToken;
}

export function getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
}