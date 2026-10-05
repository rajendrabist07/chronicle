import { apiFetch } from './api';
import type { ApiSuccessResponse } from '../types';

export interface SubmitReportInput {
  targetType: 'POST' | 'COMMENT' | 'USER';
  targetId: string;
  reason: 'SPAM' | 'HARASSMENT' | 'MISINFORMATION' | 'PLAGIARISM' | 'OTHER';
  details?: string;
}

export interface ReportResult {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
}

/**
 * Submit a moderation report.
 * POST /api/v1/reports
 */
export async function submitReport(
  input: SubmitReportInput,
  token: string
): Promise<ReportResult> {
  const res = await apiFetch<ApiSuccessResponse<ReportResult>>('/reports', {
    method: 'POST',
    body: JSON.stringify(input),
    token,
  });
  return res.data;
}
