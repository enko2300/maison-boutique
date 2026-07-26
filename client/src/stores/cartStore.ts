import { create } from 'zustand';
import type { CartItem, Product } from '../types';
import { cartApi } from '../api/cart';
import { productApi } from '../api/products';

// Local cart item stored in localStorage (before login)
interface LocalCartItem {
  productId: string;
  quantity: number;
  size: string | null;
  color: string | null;
  product: Product; // Store full product for display
}

const LOCAL_KEY = 'cart_local';

function loadLocalCart(): LocalCartItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCart(items: LocalCartItem[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
}

function clearLocalCart() {
  localStorage.removeItem(LOCAL_KEY);
}

interface CartState {
  items: CartItem[];
  localItems: LocalCartItem[];
  loading: boolean;
  isLoggedIn: boolean;
  fetch: () => Promise<void>;
  addItem: (productId: string, size?: string, color?: string, product?: Product) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clear: () => Promise<void>;
  syncLocalToServer: () => Promise<void>;
  total: () => number;
  count: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  localItems: loadLocalCart(),
  loading: false,
  isLoggedIn: false,

  fetch: async () => {
    set({ loading: true, isLoggedIn: true });
    try {
      const { data } = await cartApi.list();
      set({ items: data });

      // Merge local cart to server if there are local items
      const local = get().localItems;
      if (local.length > 0) {
        await get().syncLocalToServer();
      }
    } catch {
      set({ isLoggedIn: false });
    } finally {
      set({ loading: false });
    }
  },

  addItem: async (productId, size, color, product?) => {
    if (get().isLoggedIn) {
      // Optimistic: increment count immediately
      const items = get().items;
      const existing = items.find(i => i.productId === productId && i.size === (size || null) && i.color === (color || null));
      if (existing) {
        set({ items: items.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i) });
      }
      // Then sync with server
      try {
        const { data } = await cartApi.add({ productId, quantity: 1, size, color });
        const fresh = get().items;
        const idx = fresh.findIndex(i => i.id === data.id);
        if (idx >= 0) {
          const updated = [...fresh];
          updated[idx] = data;
          set({ items: updated });
        } else {
          set({ items: [...fresh, data] });
        }
      } catch {
        // Revert on error
        await get().fetch();
      }
    } else {
      // Not logged in — add to local cart instantly
      const local = get().localItems;
      const existingIdx = local.findIndex(i => i.productId === productId && i.size === (size || null) && i.color === (color || null));

      if (existingIdx >= 0) {
        const updated = [...local];
        updated[existingIdx] = { ...updated[existingIdx], quantity: updated[existingIdx].quantity + 1 };
        set({ localItems: updated });
        saveLocalCart(updated);
      } else {
        // Use provided product or fetch it
        let prod = product;
        if (!prod) {
          const { data } = await productApi.detail(productId);
          prod = data;
        }
        const newItem: LocalCartItem = { productId, quantity: 1, size: size || null, color: color || null, product: prod };
        const updated = [...local, newItem];
        set({ localItems: updated });
        saveLocalCart(updated);
      }
    }
  },

  updateQuantity: async (id, quantity) => {
    if (quantity < 1) return get().removeItem(id);

    if (get().isLoggedIn) {
      const { data } = await cartApi.update(id, quantity);
      set({ items: get().items.map(i => i.id === id ? data : i) });
    } else {
      // Update local cart by productId
      const local = get().localItems;
      const updated = local.map(i => i.productId === id ? { ...i, quantity } : i);
      set({ localItems: updated });
      saveLocalCart(updated);
    }
  },

  removeItem: async (id) => {
    if (get().isLoggedIn) {
      await cartApi.remove(id);
      set({ items: get().items.filter(i => i.id !== id) });
    } else {
      const local = get().localItems;
      const updated = local.filter(i => i.productId !== id);
      set({ localItems: updated });
      saveLocalCart(updated);
    }
  },

  clear: async () => {
    if (get().isLoggedIn) {
      await cartApi.clear();
    }
    set({ items: [], localItems: [] });
    clearLocalCart();
  },

  syncLocalToServer: async () => {
    const local = get().localItems;
    if (local.length === 0) return;

    // Add each local item to server
    for (const item of local) {
      try {
        await cartApi.add({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size || undefined,
          color: item.color || undefined,
        });
      } catch {
        // Item might already exist in cart, ignore
      }
    }

    // Clear local cart and re-fetch from server
    clearLocalCart();
    set({ localItems: [] });
    const { data } = await cartApi.list();
    set({ items: data });
  },

  total: () => {
    const { items, localItems, isLoggedIn } = get();
    if (isLoggedIn) {
      return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    }
    return localItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  },

  count: () => {
    const { items, localItems, isLoggedIn } = get();
    if (isLoggedIn) {
      return items.reduce((sum, item) => sum + item.quantity, 0);
    }
    return localItems.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
