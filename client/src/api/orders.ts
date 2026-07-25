import api from './client';
import type { Order } from '../types';

export const orderApi = {
  list: () => api.get<Order[]>('/orders'),
  checkout: () => api.post<{ order: Order; payment: any }>('/orders/checkout'),
};
