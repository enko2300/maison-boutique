import api from './client';

export const promoApi = {
  validate: (code: string, subtotal: number) =>
    api.post('/promo/validate', { code, subtotal }).then(r => r.data),
};
