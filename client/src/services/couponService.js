import api from './api';

export const couponService = {
  validateCoupon: async (code, subtotal) => {
    const response = await api.post('/coupons/validate', { code, subtotal });
    return response.data;
  },
  getCoupons: async () => {
    const response = await api.get('/coupons');
    return response.data;
  },
  createCoupon: async (data) => {
    const response = await api.post('/coupons', data);
    return response.data;
  },
  updateCoupon: async (id, data) => {
    const response = await api.put(`/coupons/${id}`, data);
    return response.data;
  },
  deleteCoupon: async (id) => {
    const response = await api.delete(`/coupons/${id}`);
    return response.data;
  }
};
