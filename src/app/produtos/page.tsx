import type { Metadata } from "next";
import { ProductCard } from "@/components/product-card";
import { ProductFilters } from "@/components/product-filters";
import { searchProducts } from "@/lib/data";

export const metadata: Metadata = { title: "Produtos" };

interface Props {
  searchParams: Promise<{ categoria?: string; loja?: string; ordenar?: string; q?: string }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const { categoria, loja, ordenar, q } = await searchParams;

  const sortMap = { "menor-preco": "price-asc", "maior-preco": "price-desc" } as const;

  const result = searchProducts({
    category: categoria || undefined,
    store: loja || undefined,
    query: q || undefined,
    sort: ordenar ? sortMap[ordenar as keyof typeof sortMap] : undefined
  });

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">
        {q ? `Resultados para "${q}"` : "Todos os produtos"}
      </h1>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <ProductFilters categoria={categoria} loja={loja} ordenar={ordenar} />

        <div>
          <div className="mb-4 flex items-center justify-between text-sm text-slate-600">
            <span>{result.length} produto(s) encontrado(s)</span>
            <form method="get" className="flex items-center gap-2">
              {categoria && <input type="hidden" name="categoria" value={categoria} />}
              {loja && <input type="hidden" name="loja" value={loja} />}
              {q && <input type="hidden" name="q" value={q} />}
              <label htmlFor="ordenar" className="sr-only">
                Ordenar
              </label>
              <select
                id="ordenar"
                name="ordenar"
                defaultValue={ordenar}
                className="rounded-md border border-slate-300 py-1.5 text-sm"
              >
                <option value="">Relevância</option>
                <option value="menor-preco">Menor preço</option>
                <option value="maior-preco">Maior preço</option>
              </select>
              <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">
                Ordenar
              </button>
            </form>
          </div>

          {result.length === 0 ? (
            <p className="card p-8 text-center text-slate-500">
              Nenhum produto encontrado com esses filtros.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {result.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
