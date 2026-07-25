import api from './client';

export const reviewApi = {
  list: (productId: string, page = 1) =>
    api.get(`/products/${productId}/reviews`, { params: { page } }).then(r => r.data),

  stats: (productId: string) =>
    api.get(`/products/${productId}/review-stats`).then(r => r.data),

  create: (productId: string, data: { rating: number; comment?: string }) =>
    api.post(`/products/${productId}/reviews`, data).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/reviews/${id}`).then(r => r.data),
};
