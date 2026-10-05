import { apiFetch } from './api';
import type { ApiSuccessResponse } from '../types';

export interface AiSuggestions {
  title: string;
  tags: string[];
  summary: string;
}

export interface AiImproveInput {
  content: string;
  tone?: string;
}

export interface AiImproveResult {
  improvedContent: string;
  critique?: string;
  changes?: string[];
  readabilityScore?: number;
  readingTimeMinutes?: number;
}

export interface AiOutlineInput {
  topic: string;
  targetAudience?: string;
}

export interface AiOutlineSection {
  heading: string;
  points: string[];
}

export interface AiOutlineResult {
  title: string;
  targetAudience?: string;
  sections: AiOutlineSection[];
  estimatedTotalWords?: number;
}

/**
 * Generate title, tags, and summary for draft content.
 * POST /api/v1/ai/suggest
 */
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

/**
 * Improve and polish blog post prose with tone selection.
 * POST /api/v1/ai/improve
 */
export async function improveContent(
  input: AiImproveInput,
  token: string
): Promise<AiImproveResult> {
  const res = await apiFetch<ApiSuccessResponse<AiImproveResult>>('/ai/improve', {
    method: 'POST',
    body: JSON.stringify(input),
    token,
  });
  return res.data;
}

/**
 * Generate structured article outline for topic.
 * POST /api/v1/ai/outline
 */
export async function generateOutline(
  input: AiOutlineInput,
  token: string
): Promise<AiOutlineResult> {
  const res = await apiFetch<ApiSuccessResponse<AiOutlineResult>>('/ai/outline', {
    method: 'POST',
    body: JSON.stringify(input),
    token,
  });
  return res.data;
}
