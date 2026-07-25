import api from './client';
import type { Product, Order } from '../types';

export const adminApi = {
  products: {
    list: () => api.get<Product[]>('/admin/products'),
    create: (data: Partial<Product>) => api.post<Product>('/admin/products', data),
    update: (id: string, data: Partial<Product>) => api.put<Product>(`/admin/products/${id}`, data),
    delete: (id: string) => api.delete(`/admin/products/${id}`),
  },
  orders: {
    list: () => api.get<Order[]>('/admin/orders'),
    updateStatus: (id: string, status: string) => api.put(`/admin/orders/${id}/status`, { status }),
  },
  stats: () => api.get<{ totalProducts: number; totalOrders: number; totalUsers: number; revenue: number }>('/admin/stats'),
};
