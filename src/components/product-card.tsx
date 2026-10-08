import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatCurrency, formatInstallments } from "@/lib/format";
import { getStoreBySlug } from "@/lib/data";

export function ProductCard({ product }: { product: Product }) {
  const store = getStoreBySlug(product.storeSlug);
  const hasDiscount = !!product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <Link
      href={`/produtos/${product.slug}`}
      className="card group flex flex-col overflow-hidden transition hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <Image
          src={product.images[0]!}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        {hasDiscount && (
          <span className="absolute left-2 top-2 rounded bg-accent-500 px-2 py-0.5 text-xs font-bold text-white">
            Oferta
          </span>
        )}
        {product.freeShipping && (
          <span className="absolute bottom-2 left-2 rounded bg-emerald-600/90 px-2 py-0.5 text-[11px] font-semibold text-white">
            Frete grátis
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="text-xs font-medium uppercase tracking-wide text-brand-600">
          {store?.name}
        </span>
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-800">{product.name}</h3>

        <div className="mt-auto pt-2">
          {hasDiscount && (
            <span className="mr-2 text-xs text-slate-400 line-through">
              {formatCurrency(product.compareAtPrice!)}
            </span>
          )}
          <span className="text-base font-bold text-slate-900">{formatCurrency(product.price)}</span>
          <p className="text-xs text-slate-500">{formatInstallments(product.price, product.installments.count)}</p>
        </div>
      </div>
    </Link>
  );
}
