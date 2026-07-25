import api from './client';
import type { Product } from '../types';

export const productApi = {
  list: (params?: { category?: string; search?: string; page?: number }) =>
    api.get<{ products: Product[]; total: number; page: number; totalPages: number }>('/products', { params }),

  featured: () => api.get<Product[]>('/products/featured'),

  categories: () => api.get<string[]>('/products/categories'),

  detail: (id: string) => api.get<Product>(`/products/${id}`),
};
