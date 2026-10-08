"use client";

import { useEffect, useState } from "react";
import { useCartStore, cartTotals } from "@/lib/cart-store";

export function CartIndicator() {
  const items = useCartStore((s) => s.items);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const count = mounted ? cartTotals(items).count : 0;
  if (count === 0) return null;

  return (
    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[11px] font-bold text-white">
      {count}
    </span>
  );
}
