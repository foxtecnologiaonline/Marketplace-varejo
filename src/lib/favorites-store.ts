"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesState {
  ids: string[];
  isFavorite: (productId: string) => boolean;
  toggle: (productId: string) => void;
  clear: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      isFavorite: (productId) => get().ids.includes(productId),
      toggle: (productId) => {
        const ids = get().ids;
        set({
          ids: ids.includes(productId) ? ids.filter((id) => id !== productId) : [...ids, productId]
        });
      },
      clear: () => set({ ids: [] })
    }),
    { name: "marketplace-varejo-favorites" }
  )
);
