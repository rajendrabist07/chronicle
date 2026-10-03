export interface User {
    id: string;
    email: string;
    name: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export interface Post {
    id: string;
    title: string;
    slug: string;
    content: string;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    publishedAt: string | null;
    authorId: string;
    authorName: string;
    createdAt: string;
    tags?: { id: string; name: string }[];
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