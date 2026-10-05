import { apiFetch } from './api';
import type { ApiSuccessResponse } from '../types';
import type { QuizQuestion } from '../components/reading/ComprehensionQuiz';

export interface QuizAttemptAnswer {
  questionId: string;
  selectedOption: number;
}

export interface QuizAttemptResult {
  score: number;
  totalQuestions: number;
  passed: boolean;
  feedback: {
    questionId: string;
    isCorrect: boolean;
    correctOption: number;
    explanation: string;
    verbatimCitation?: string;
  }[];
}

export interface AskArticleResult {
  answer: string;
  verbatimQuotes: string[];
  confidence: string;
  sourceParagraphs?: string[];
}

export interface ComprehensionAnalytics {
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  confusionPoints: {
    questionId: string;
    question: string;
    incorrectRate: number;
    commonMisconception?: string;
  }[];
}

/**
 * Generate an AI-grounded comprehension quiz for an article.
 * POST /api/v1/posts/{postId}/quiz/generate
 */
export async function generatePostQuiz(
  postId: string,
  token: string
): Promise<QuizQuestion[]> {
  const res = await apiFetch<ApiSuccessResponse<QuizQuestion[]>>(
    `/posts/${postId}/quiz/generate`,
    {
      method: 'POST',
      token,
    }
  );
  return res.data;
}

/**
 * Get the comprehension quiz for an article (public).
 * GET /api/v1/posts/{postId}/quiz
 */
export async function fetchPostQuiz(postId: string): Promise<QuizQuestion[]> {
  const res = await apiFetch<ApiSuccessResponse<QuizQuestion[]>>(
    `/posts/${postId}/quiz`
  );
  return res.data;
}

/**
 * Submit answers to an article quiz and receive instant grounded feedback.
 * POST /api/v1/posts/{postId}/quiz/attempt
 */
export async function submitQuizAttempt(
  postId: string,
  answers: QuizAttemptAnswer[]
): Promise<QuizAttemptResult> {
  const res = await apiFetch<ApiSuccessResponse<QuizAttemptResult>>(
    `/posts/${postId}/quiz/attempt`,
    {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }
  );
  return res.data;
}

/**
 * Ask this article a question and receive a grounded answer with verbatim quotes.
 * POST /api/v1/posts/{postId}/ask
 */
export async function askArticleQuestion(
  postId: string,
  question: string
): Promise<AskArticleResult> {
  const res = await apiFetch<ApiSuccessResponse<AskArticleResult>>(
    `/posts/${postId}/ask`,
    {
      method: 'POST',
      body: JSON.stringify({ question }),
    }
  );
  return res.data;
}

/**
 * Get reader comprehension analytics & confusion points for an article (Author only).
 * GET /api/v1/posts/{postId}/analytics/comprehension
 */
export async function fetchComprehensionAnalytics(
  postId: string,
  token: string
): Promise<ComprehensionAnalytics> {
  const res = await apiFetch<ApiSuccessResponse<ComprehensionAnalytics>>(
    `/posts/${postId}/analytics/comprehension`,
    { token }
  );
  return res.data;
}
