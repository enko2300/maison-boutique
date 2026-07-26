import api from './client';
import type { Order } from '../types';

export const orderApi = {
  list: () => api.get<Order[]>('/orders'),
  checkout: (promoCode?: string) => api.post<{ order: Order; payment: any; invoiceUrl?: string }>('/orders/checkout', { promoCode }),
};
