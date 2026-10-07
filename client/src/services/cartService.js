import api from './api';

export const cartService = {
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },
  addToCart: async (food_id, quantity = 1) => {
    const response = await api.post('/cart/items', { food_id, quantity });
    return response.data;
  },
  updateCartItem: async (cart_item_id, quantity) => {
    const response = await api.put(`/cart/items/${cart_item_id}`, { quantity });
    return response.data;
  },
  removeCartItem: async (cart_item_id) => {
    const response = await api.delete(`/cart/items/${cart_item_id}`);
    return response.data;
  },
  clearCart: async () => {
    const response = await api.delete('/cart');
    return response.data;
  }
};
