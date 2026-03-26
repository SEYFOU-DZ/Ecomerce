'use client';

const API_URI_RAW = process.env.NEXT_PUBLIC_API_URI || 'http://localhost:5000/';
const API_URI = API_URI_RAW.endsWith("/") ? API_URI_RAW : `${API_URI_RAW}/`;

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, newToken = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(newToken);
        }
    });
    failedQueue = [];
};

// Read a cookie value by name (works in browser only)
function getCookieValue(name) {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
}

async function request(endpoint, options = {}, _retryToken = null) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URI}${String(endpoint).replace(/^\/+/, "")}`;

    // Read the token from the frontend cookie to send as Authorization header
    const token = _retryToken || getCookieValue('token');

    const fetchOptions = {
        ...options,
        credentials: "include",
        headers: {
            ...options.headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }
    };

    let response = await fetch(url, fetchOptions);

    // Standard interceptor logic for 401s
    if (
        response.status === 401 &&
        !url.includes('refreshAuth') &&
        !url.includes('login') &&
        !url.includes('register')
    ) {
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then((newToken) => {
                return request(url, options, newToken);
            }).catch(() => response);
        }

        isRefreshing = true;

        try {
            const refreshRes = await fetch(`${API_URI}api/refreshAuth`, {
                method: "POST",
                credentials: "include"
            });

            if (refreshRes.ok) {
                const data = await refreshRes.json().catch(() => ({}));
                const newToken = data?.token;

                if (newToken) {
                    // Persist refreshed token in the frontend domain cookie
                    await fetch('/api/set-token', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token: newToken }),
                    }).catch(() => {});
                }

                processQueue(null, newToken);
                // Retry original request with new token
                response = await request(url, options, newToken);
            } else {
                processQueue(new Error('Refresh failed'));
                // Clear stale cookie
                fetch('/api/clear-token', { method: 'POST' }).catch(() => {});
            }
        } catch (error) {
            processQueue(error);
            console.error("Token refresh failed:", error);
        } finally {
            isRefreshing = false;
        }
    }

    return response;
}

export const http = {
    get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
    post: (endpoint, body, options) => request(endpoint, {
        ...options,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        body: body ? JSON.stringify(body) : undefined
    }),
    put: (endpoint, body, options) => request(endpoint, {
        ...options,
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        body: body ? JSON.stringify(body) : undefined
    }),
    patch: (endpoint, body, options) => request(endpoint, {
        ...options,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        body: body ? JSON.stringify(body) : undefined
    }),
    delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
    postForm: (endpoint, body, options) => request(endpoint, {
        ...options,
        method: 'POST',
        body: body
    }),
    putForm: (endpoint, body, options) => request(endpoint, {
        ...options,
        method: 'PUT',
        body: body
    }),
};
