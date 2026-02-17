import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// In-memory CSRF token (fallback when cross-origin cookie isn't readable from document.cookie)
let _csrfToken = null;

/** Set CSRF token from the /api/csrf-token response body */
export const setCsrfToken = (token) => { _csrfToken = token; };

// Helper: read a cookie value by name
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Send cookies with every request
});

// Request interceptor: attach CSRF token header on mutating requests
api.interceptors.request.use((config) => {
    const method = (config.method || '').toUpperCase();
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        // Prefer cookie, fall back to in-memory token from /api/csrf-token response
        const csrfToken = getCookie('csrf-token') || _csrfToken;
        if (csrfToken) {
            config.headers['X-CSRF-Token'] = csrfToken;
        }
    }
    return config;
});

// Response interceptor: auto-logout on 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Dispatch a custom event so AuthContext can handle logout
            window.dispatchEvent(new Event('auth:unauthorized'));
        }
        return Promise.reject(error);
    }
);

// ─── Authentication ───
export const authApi = {
    signup: (data) => api.post('/auth/signup', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.get('/auth/logout'),
    getMe: () => api.get('/auth/me')
};

// ─── Transactions ───
export const transactionApi = {
    getAll: (params) => api.get('/api/transactions', { params }),
    create: (formData) => api.post('/api/transactions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getOne: (id) => api.get(`/api/transactions/${id}`),
    update: (id, formData) => api.put(`/api/transactions/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => api.delete(`/api/transactions/${id}`),
    getByAccount: (accountId) => api.get(`/api/transactions/account/${accountId}`)
};

// ─── Accounts ───
export const accountApi = {
    getAll: () => api.get('/api/accounts'),
    create: (data) => api.post('/api/accounts', data),
    getOne: (id) => api.get(`/api/accounts/${id}`),
    update: (id, data) => api.put(`/api/accounts/${id}`, data),
    delete: (id) => api.delete(`/api/accounts/${id}`)
};

// ─── Categories ───
export const categoryApi = {
    getAll: () => api.get('/api/categories'),
    create: (data) => api.post('/api/categories', data),
    update: (id, data) => api.put(`/api/categories/${id}`, data),
    delete: (id) => api.delete(`/api/categories/${id}`)
};

// ─── Budgets ───
export const budgetApi = {
    getAll: () => api.get('/api/budgets'),
    create: (data) => api.post('/api/budgets', data),
    update: (id, data) => api.put(`/api/budgets/${id}`, data),
    delete: (id) => api.delete(`/api/budgets/${id}`)
};

// ─── User / Settings ───
export const userApi = {
    getProfile: () => api.get('/api/user/profile'),
    updateProfile: (data) => api.put('/api/user/profile', data),
    changePassword: (data) => api.put('/api/user/change-password', data),
    updatePreferences: (data) => api.put('/api/user/preferences', data),
    exportData: () => api.get('/api/user/export'),
    clearAllData: () => api.delete('/api/user/data'),
    deleteAccount: () => api.delete('/api/user/account'),
    exportCSV: () => api.get('/api/user/export/csv', { responseType: 'blob' }),
    importCSV: (formData) => api.post('/api/user/import/csv', formData)
};

// ─── Contact ───
export const contactApi = {
    send: (data) => api.post('/api/contact', data)
};

export default api;
