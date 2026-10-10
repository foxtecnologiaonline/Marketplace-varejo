"use client";

import { useFavoritesStore } from "@/lib/favorites-store";
import { useHydrated } from "@/lib/use-hydrated";

export function FavoritesIndicator() {
  const count = useFavoritesStore((s) => s.ids.length);
  const hydrated = useHydrated();

  if (!hydrated || count === 0) return null;

  return (
    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[11px] font-bold text-white">
      {count}
    </span>
  );
}
