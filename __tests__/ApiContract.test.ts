import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as apiModule from '../app/lib/api';
import { suggestContent, improveContent, generateOutline } from '../app/lib/ai';
import {
  generatePostQuiz,
  fetchPostQuiz,
  submitQuizAttempt,
  askArticleQuestion,
  fetchComprehensionAnalytics,
} from '../app/lib/comprehension';
import { submitReport } from '../app/lib/reports';
import {
  getModerationQueue,
  approvePost,
  rejectPost,
  setUserTrustLevel,
  getAuditLogs,
} from '../app/lib/admin';

describe('OpenAPI Contract Client Coverage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('AI Endpoints', () => {
    it('calls POST /ai/suggest', async () => {
      const spy = vi.spyOn(apiModule, 'apiFetch').mockResolvedValue({
        success: true,
        data: { title: 'T', tags: ['react'], summary: 'S' },
      } as any);

      const res = await suggestContent('my draft content', 'token-123');
      expect(spy).toHaveBeenCalledWith('/ai/suggest', expect.objectContaining({
        method: 'POST',
        token: 'token-123',
      }));
      expect(res.title).toBe('T');
    });

    it('calls POST /ai/improve', async () => {
      const spy = vi.spyOn(apiModule, 'apiFetch').mockResolvedValue({
        success: true,
        data: { improvedContent: 'Polished text', readabilityScore: 85 },
      } as any);

      const res = await improveContent({ content: 'raw', tone: 'Technical' }, 'token-123');
      expect(spy).toHaveBeenCalledWith('/ai/improve', expect.objectContaining({
        method: 'POST',
      }));
      expect(res.improvedContent).toBe('Polished text');
    });

    it('calls POST /ai/outline', async () => {
      const spy = vi.spyOn(apiModule, 'apiFetch').mockResolvedValue({
        success: true,
        data: { title: 'Architecture Guide', sections: [] },
      } as any);

      const res = await generateOutline({ topic: 'Distributed Systems' }, 'token-123');
      expect(spy).toHaveBeenCalledWith('/ai/outline', expect.objectContaining({
        method: 'POST',
      }));
      expect(res.title).toBe('Architecture Guide');
    });
  });

  describe('Comprehension Endpoints', () => {
    it('calls POST /posts/:id/quiz/generate', async () => {
      const spy = vi.spyOn(apiModule, 'apiFetch').mockResolvedValue({
        success: true,
        data: [{ id: 'q1', question: 'Q?', options: [], correctIndex: 0, explanation: 'E' }],
      } as any);

      const res = await generatePostQuiz('post-1', 'token-123');
      expect(spy).toHaveBeenCalledWith('/posts/post-1/quiz/generate', expect.objectContaining({
        method: 'POST',
      }));
      expect(res).toHaveLength(1);
    });

    it('calls GET /posts/:id/quiz', async () => {
      const spy = vi.spyOn(apiModule, 'apiFetch').mockResolvedValue({
        success: true,
        data: [],
      } as any);

      await fetchPostQuiz('post-1');
      expect(spy).toHaveBeenCalledWith('/posts/post-1/quiz');
    });

    it('calls POST /posts/:id/quiz/attempt', async () => {
      const spy = vi.spyOn(apiModule, 'apiFetch').mockResolvedValue({
        success: true,
        data: { score: 3, totalQuestions: 3, passed: true, feedback: [] },
      } as any);

      const res = await submitQuizAttempt('post-1', [{ questionId: 'q1', selectedOption: 1 }]);
      expect(spy).toHaveBeenCalledWith('/posts/post-1/quiz/attempt', expect.objectContaining({
        method: 'POST',
      }));
      expect(res.passed).toBe(true);
    });

    it('calls POST /posts/:id/ask', async () => {
      const spy = vi.spyOn(apiModule, 'apiFetch').mockResolvedValue({
        success: true,
        data: { answer: 'Grounded text', verbatimQuotes: ['quote 1'], confidence: '100%' },
      } as any);

      const res = await askArticleQuestion('post-1', 'What is MVCC?');
      expect(spy).toHaveBeenCalledWith('/posts/post-1/ask', expect.objectContaining({
        method: 'POST',
      }));
      expect(res.confidence).toBe('100%');
    });

    it('calls GET /posts/:id/analytics/comprehension', async () => {
      const spy = vi.spyOn(apiModule, 'apiFetch').mockResolvedValue({
        success: true,
        data: { totalAttempts: 50, averageScore: 82, passRate: 90, confusionPoints: [] },
      } as any);

      const res = await fetchComprehensionAnalytics('post-1', 'token-123');
      expect(spy).toHaveBeenCalledWith('/posts/post-1/analytics/comprehension', expect.objectContaining({
        token: 'token-123',
      }));
      expect(res.totalAttempts).toBe(50);
    });
  });

  describe('Reports & Moderation Endpoints', () => {
    it('calls POST /reports', async () => {
      const spy = vi.spyOn(apiModule, 'apiFetch').mockResolvedValue({
        success: true,
        data: { id: 'r1', targetType: 'POST', targetId: 'p1', reason: 'SPAM', status: 'PENDING' },
      } as any);

      const res = await submitReport(
        { targetType: 'POST', targetId: 'p1', reason: 'SPAM' },
        'token-123'
      );
      expect(spy).toHaveBeenCalledWith('/reports', expect.objectContaining({
        method: 'POST',
      }));
      expect(res.reason).toBe('SPAM');
    });

    it('calls admin approve and reject', async () => {
      const approveSpy = vi.spyOn(apiModule, 'apiFetch').mockResolvedValue({
        success: true,
        data: { id: 'p1', status: 'PUBLISHED' },
      } as any);

      await approvePost('p1', 'token-123');
      expect(approveSpy).toHaveBeenCalledWith('/admin/posts/p1/approve', expect.objectContaining({
        method: 'POST',
      }));

      await rejectPost('p1', 'Violates policy', 'token-123');
      expect(approveSpy).toHaveBeenCalledWith('/admin/posts/p1/reject', expect.objectContaining({
        method: 'POST',
      }));
    });

    it('calls admin set-trust-level and audit-logs', async () => {
      const spy = vi.spyOn(apiModule, 'apiFetch').mockResolvedValue({
        success: true,
        data: { id: 'u1', trustLevel: 'AUTHORITY' },
      } as any);

      await setUserTrustLevel('u1', 'AUTHORITY', 'token-123');
      expect(spy).toHaveBeenCalledWith('/admin/users/u1/set-trust-level', expect.objectContaining({
        method: 'POST',
      }));

      await getAuditLogs('token-123', { action: 'POST_PUBLISH', page: 1 });
      expect(spy).toHaveBeenCalledWith('/audit-logs?action=POST_PUBLISH&page=1', expect.objectContaining({
        token: 'token-123',
      }));
    });
  });
});
