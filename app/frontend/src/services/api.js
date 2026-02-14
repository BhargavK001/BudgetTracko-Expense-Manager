import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_URL
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

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
    deleteAccount: () => api.delete('/api/user/account')
};

export default api;
