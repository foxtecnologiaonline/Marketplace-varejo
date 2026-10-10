"use client";

import { Heart } from "lucide-react";
import { useFavoritesStore } from "@/lib/favorites-store";
import { useHydrated } from "@/lib/use-hydrated";

interface Props {
  productId: string;
  className?: string;
}

// Botão de favoritar reutilizável: no card (sobre a imagem, dentro de um <Link>) e
// na página do produto. preventDefault/stopPropagation porque, no card, ele fica
// dentro do <Link> que leva para a página do produto.
export function FavoriteButton({ productId, className = "" }: Props) {
  const hydrated = useHydrated();
  const isFavorite = useFavoritesStore((s) => s.isFavorite(productId));
  const toggle = useFavoritesStore((s) => s.toggle);

  return (
    <button
      type="button"
      aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      aria-pressed={hydrated && isFavorite}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      className={`flex items-center justify-center rounded-full bg-white/90 p-1.5 shadow-sm transition hover:bg-white ${className}`}
    >
      <Heart
        className={`h-4 w-4 ${hydrated && isFavorite ? "fill-accent-500 text-accent-500" : "text-slate-600"}`}
      />
    </button>
  );
}
