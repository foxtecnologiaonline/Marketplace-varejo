import type { Metadata } from "next";
import { ProductCard } from "@/components/product-card";
import { searchProducts } from "@/lib/data";

export const metadata: Metadata = { title: "Busca" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q: rawQ } = await searchParams;
  const q = rawQ?.trim() ?? "";
  const result = q ? searchProducts({ query: q }) : [];

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">
        {q ? `Resultados para "${q}"` : "Digite algo para buscar"}
      </h1>

      {q && result.length === 0 && (
        <p className="card p-8 text-center text-slate-500">
          Nenhum produto encontrado para &quot;{q}&quot;. Tente outro termo ou navegue pelas categorias.
        </p>
      )}

      {result.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {result.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
