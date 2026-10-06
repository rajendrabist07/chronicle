export interface User {
    id: string;
    email: string;
    name: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
    emailVerified?: boolean;
    bio?: string | null;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export type PostStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';

export interface Post {
    id: string;
    title: string;
    slug: string;
    content: string;
    status: PostStatus;
    publishedAt: string | null;
    authorId: string;
    authorName: string;
    createdAt: string;
    tags?: { id: string; name: string }[];
    rejectionReason?: string | null;
}

export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
}

export interface ApiErrorResponse {
    success: false;
    message: string;
    statusCode: number;
}

export interface PaginatedResponse<T> {
    success: true;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface Notification {
    id: string;
    userId: string;
    type: 'LIKE' | 'COMMENT' | 'SYSTEM' | string;
    message: string;
    read: boolean;
    data?: Record<string, any> | null;
    createdAt: string;
}