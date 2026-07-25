import { create } from 'zustand';
import type { CartItem } from '../types';
import { cartApi } from '../api/cart';

interface CartState {
  items: CartItem[];
  loading: boolean;
  fetch: () => Promise<void>;
  addItem: (productId: string, size?: string, color?: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clear: () => Promise<void>;
  total: () => number;
  count: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const { data } = await cartApi.list();
      set({ items: data });
    } finally {
      set({ loading: false });
    }
  },

  addItem: async (productId, size, color) => {
    const { data } = await cartApi.add({ productId, quantity: 1, size, color });
    const items = get().items;
    const idx = items.findIndex(i => i.id === data.id);
    if (idx >= 0) {
      const updated = [...items];
      updated[idx] = data;
      set({ items: updated });
    } else {
      set({ items: [...items, data] });
    }
  },

  updateQuantity: async (id, quantity) => {
    if (quantity < 1) return get().removeItem(id);
    const { data } = await cartApi.update(id, quantity);
    set({ items: get().items.map(i => i.id === id ? data : i) });
  },

  removeItem: async (id) => {
    await cartApi.remove(id);
    set({ items: get().items.filter(i => i.id !== id) });
  },

  clear: async () => {
    await cartApi.clear();
    set({ items: [] });
  },

  total: () => get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  count: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
}));
