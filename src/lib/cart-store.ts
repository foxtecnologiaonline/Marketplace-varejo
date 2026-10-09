"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "./types";
import { MAX_ITEM_QUANTITY } from "./config";
import { products } from "./data";
import { centsToReais, lineTotalCents, sumCents } from "./money";

interface CartState {
  items: CartItem[];
  addItem: (productId: string, size: string, color: string, quantity?: number) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clear: () => void;
}

const sameLine = (i: CartItem, productId: string, size: string, color: string) =>
  i.productId === productId && i.size === size && i.color === color;

// Mesmo teto validado no servidor: evita o cliente montar um carrinho que o checkout vai recusar.
const clampQuantity = (quantity: number) => Math.min(MAX_ITEM_QUANTITY, Math.max(1, Math.floor(quantity)));

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (productId, size, color, quantity = 1) => {
        const items = get().items;
        const existing = items.find((i) => sameLine(i, productId, size, color));
        if (existing) {
          set({
            items: items.map((i) =>
              i === existing ? { ...i, quantity: clampQuantity(i.quantity + quantity) } : i
            )
          });
        } else {
          set({ items: [...items, { productId, size, color, quantity: clampQuantity(quantity) }] });
        }
      },
      removeItem: (productId, size, color) => {
        set({ items: get().items.filter((i) => !sameLine(i, productId, size, color)) });
      },
      updateQuantity: (productId, size, color, quantity) => {
        set({
          items: get().items.map((i) =>
            sameLine(i, productId, size, color) ? { ...i, quantity: clampQuantity(quantity) } : i
          )
        });
      },
      clear: () => set({ items: [] })
    }),
    { name: "marketplace-varejo-cart" }
  )
);

export function cartTotals(items: CartItem[]) {
  const lineCents: number[] = [];
  let count = 0;
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) continue;
    lineCents.push(lineTotalCents(product.price, item.quantity));
    count += item.quantity;
  }
  return { subtotal: centsToReais(sumCents(lineCents)), count };
}
