"use client";

import Link from "next/link";
import { useFavoritesStore } from "@/lib/favorites-store";
import { useHydrated } from "@/lib/use-hydrated";
import { products } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { ProductGridSkeleton } from "@/components/skeleton";

// Metadata estática não pode vir de um client component; o título já é definido
// pelo layout pai. A página precisa ser client porque a lista de favoritos vive
// só no localStorage do navegador (ver src/lib/favorites-store.ts).
export default function WishlistPage() {
  const hydrated = useHydrated();
  const ids = useFavoritesStore((s) => s.ids);
  const favoriteProducts = products.filter((p) => ids.includes(p.id));

  return (
    <div className="container-page py-12">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Lista de desejos</h1>

      {!hydrated ? (
        <ProductGridSkeleton count={4} />
      ) : favoriteProducts.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 p-8 text-center text-slate-500">
          <p>Você ainda não adicionou produtos à sua lista de desejos.</p>
          <Link href="/produtos" className="btn-primary">
            Ver produtos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {favoriteProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
