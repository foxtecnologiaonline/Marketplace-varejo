"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "./types";
import { getProductBySlug, products } from "./data";

interface CartState {
  items: CartItem[];
  addItem: (productId: string, size: string, color: string, quantity?: number) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (productId, size, color, quantity = 1) => {
        const items = get().items;
        const existing = items.find(
          (i) => i.productId === productId && i.size === size && i.color === color
        );
        if (existing) {
          set({
            items: items.map((i) =>
              i === existing ? { ...i, quantity: i.quantity + quantity } : i
            )
          });
        } else {
          set({ items: [...items, { productId, size, color, quantity }] });
        }
      },
      removeItem: (productId, size, color) => {
        set({
          items: get().items.filter(
            (i) => !(i.productId === productId && i.size === size && i.color === color)
          )
        });
      },
      updateQuantity: (productId, size, color, quantity) => {
        set({
          items: get().items.map((i) =>
            i.productId === productId && i.size === size && i.color === color
              ? { ...i, quantity: Math.max(1, quantity) }
              : i
          )
        });
      },
      clear: () => set({ items: [] })
    }),
    { name: "marketplace-varejo-cart" }
  )
);

export function cartTotals(items: CartItem[]) {
  let subtotal = 0;
  let count = 0;
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) continue;
    subtotal += product.price * item.quantity;
    count += item.quantity;
  }
  return { subtotal, count };
}

export { getProductBySlug };
