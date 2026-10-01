import { getRefreshToken, refreshAccessToken, saveTokens, clearTokens } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiOptions extends RequestInit {
    token?: string;
}


let refreshPromise: Promise<string> | null = null;

async function getNewAccessToken(): Promise<string> {
    if (!refreshPromise) {
        const rt = getRefreshToken();
        if (!rt) {
            throw new Error('No refresh token');
        }
        refreshPromise = refreshAccessToken(rt).finally(() => {
            refreshPromise = null; // agadi ko refresh cycle ko lagi clear garne
        });
    }
    return refreshPromise;
}

async function doFetch<T>(path: string, options: ApiOptions): Promise<T> {
    const { token, headers, ...rest } = options;

    const response = await fetch(`${API_URL}${path}`, {
        ...rest,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
    });

    if (response.status === 204) {
        return undefined as T;
    }

    const data = await response.json();

    if (!response.ok) {
        const err = new Error(data.message || 'Something went wrong') as Error & { status?: number };
        err.status = response.status;
        throw err;
    }

    return data;
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
    try {
        return await doFetch<T>(path, options);
    } catch (err) {
        const status = (err as Error & { status?: number }).status;


        if (status !== 401 || !options.token) {
            throw err;
        }

        try {
            const newAccessToken = await getNewAccessToken();

            const existingRefresh = localStorage.getItem('refreshToken');
            if (existingRefresh) saveTokens(newAccessToken, existingRefresh);


            return await doFetch<T>(path, { ...options, token: newAccessToken });
        } catch {

            clearTokens();
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
            throw err;
        }
    }
}