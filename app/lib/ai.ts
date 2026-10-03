import { apiFetch } from './api';
import type { ApiSuccessResponse } from '../types';

export interface AiSuggestions {
    title: string;
    tags: string[];
    summary: string;
}

export async function suggestContent(
    content: string,
    token: string
): Promise<AiSuggestions> {
    const res = await apiFetch<ApiSuccessResponse<AiSuggestions>>('/ai/suggest', {
        method: 'POST',
        body: JSON.stringify({ content }),
        token,
    });
    return res.data;
}
