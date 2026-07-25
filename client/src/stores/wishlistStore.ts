import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  count: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const current = get().ids;
        if (current.includes(id)) {
          set({ ids: current.filter(i => i !== id) });
        } else {
          set({ ids: [...current, id] });
        }
      },
      has: (id) => get().ids.includes(id),
      count: () => get().ids.length,
    }),
    { name: 'wishlist' }
  )
);
