import api from './client';

export const wishlistApi = {
  list: () => api.get('/wishlist').then(r => r.data),

  add: (productId: string) =>
    api.post('/wishlist', { productId }).then(r => r.data),

  remove: (productId: string) =>
    api.delete(`/wishlist/${productId}`).then(r => r.data),

  check: (productIds: string[]) =>
    api.get('/wishlist/check', { params: { productIds: productIds.join(',') } }).then(r => r.data),
};
