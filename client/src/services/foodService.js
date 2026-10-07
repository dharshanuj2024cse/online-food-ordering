import api from './api';

export const foodService = {
  getFoods: async (params = {}) => {
    const response = await api.get('/foods', { params });
    return response.data;
  },
  getFoodById: async (id) => {
    const response = await api.get(`/foods/${id}`);
    return response.data;
  },
  createFood: async (foodData) => {
    const response = await api.post('/foods', foodData);
    return response.data;
  },
  updateFood: async (id, foodData) => {
    const response = await api.put(`/foods/${id}`, foodData);
    return response.data;
  },
  toggleAvailability: async (id) => {
    const response = await api.patch(`/foods/${id}/availability`);
    return response.data;
  },
  deleteFood: async (id) => {
    const response = await api.delete(`/foods/${id}`);
    return response.data;
  }
};
