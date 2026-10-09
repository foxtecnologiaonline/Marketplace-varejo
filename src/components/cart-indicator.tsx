"use client";

import { useCartStore, cartTotals } from "@/lib/cart-store";
import { useHydrated } from "@/lib/use-hydrated";

export function CartIndicator() {
  const items = useCartStore((s) => s.items);
  const hydrated = useHydrated();

  const count = hydrated ? cartTotals(items).count : 0;
  if (count === 0) return null;

  return (
    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[11px] font-bold text-white">
      {count}
    </span>
  );
}
