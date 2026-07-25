import api from './client';
import type { CartItem } from '../types';

export const cartApi = {
  list: () => api.get<CartItem[]>('/cart'),
  add: (data: { productId: string; quantity?: number; size?: string; color?: string }) =>
    api.post<CartItem>('/cart', data),
  update: (id: string, quantity: number) => api.put<CartItem>(`/cart/${id}`, { quantity }),
  remove: (id: string) => api.delete(`/cart/${id}`),
  clear: () => api.delete('/cart'),
};
