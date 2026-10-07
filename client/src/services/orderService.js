import api from './api';

export const orderService = {
  placeOrder: async (orderPayload) => {
    const response = await api.post('/orders', orderPayload);
    return response.data;
  },
  getOrders: async (params = {}) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },
  reorder: async (id) => {
    const response = await api.post(`/orders/${id}/reorder`);
    return response.data;
  }
};
