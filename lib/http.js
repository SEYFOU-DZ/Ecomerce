const API_URI = process.env.NEXT_PUBLIC_API_URI || 'http://localhost:5000/';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

async function request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URI}${endpoint}`;
    
    // Default config
    const fetchOptions = {
        ...options,
        credentials: "include",
        headers: {
            ...options.headers,
        }
    };

    let response = await fetch(url, fetchOptions);

    // Standard interceptor logic for 401s
    if (response.status === 401 && !url.includes('refreshAuth') && !url.includes('login') && !url.includes('register')) {
        if (isRefreshing) {
            // Wait for the current refresh process to finish
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(() => {
                // Once resolved (refresh succeeded), retry the exact same request
                return fetch(url, fetchOptions);
            }).catch(err => {
                // If refresh failed, just return the 401 response
                return response;
            });
        }

        isRefreshing = true;

        try {
            const refreshRes = await fetch(`${API_URI}api/refreshAuth`, {
                method: "POST",
                credentials: "include"
            });
            
            if (refreshRes.ok) {
                processQueue(null);
                // Retry the original request
                response = await fetch(url, fetchOptions);
            } else {
                processQueue(new Error('Refresh failed'));
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
