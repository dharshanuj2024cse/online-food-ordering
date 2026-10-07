import api from './api';

export const adminService = {
  getDashboardAnalytics: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },
  getAllUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  updateUser: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  }
};
