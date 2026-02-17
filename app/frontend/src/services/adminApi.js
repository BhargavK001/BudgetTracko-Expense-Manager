import api from './api';

// Admin API Service
export const adminApi = {
    // Dashboard
    getDashboardStats: () => api.get('/api/admin/dashboard'),
    getAnalyticsData: () => api.get('/api/admin/analytics'),

    // Transactions
    getTransactions: (params) => api.get('/api/admin/transactions', { params }),

    // Users
    getUsers: (params) => api.get('/api/admin/users', { params }),
    updateUserStatus: (id, status) => api.patch(`/api/admin/users/${id}/status`, { status }),

    // Contact Requests
    getContactRequests: (params) => api.get('/api/admin/contacts', { params }),
    markAsRead: (id) => api.patch(`/api/admin/contacts/${id}/read`),
    replyToContact: (id, replyContent) => api.post(`/api/admin/contacts/${id}/reply`, { replyContent }),

    // Config
    getConfig: () => api.get('/api/admin/config'),
    updateConfig: (key, value) => api.put('/api/admin/config', { key, value }),
};
