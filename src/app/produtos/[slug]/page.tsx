import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, Truck, Undo2 } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { ProductVariantSelector } from "@/components/product-variant-selector";
import { getProductBySlug, getRelatedProducts, getStoreBySlug, products } from "@/lib/data";
import { formatCurrency, formatInstallments } from "@/lib/format";
import type { Product } from "@/lib/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/produtos/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images[0] ? [{ url: product.images[0] }] : undefined,
      url: `/produtos/${product.slug}`
    }
  };
}

function ProductJsonLd({ product, storeName }: { product: Product; storeName?: string }) {
  const json = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.id,
    brand: storeName ? { "@type": "Brand", name: storeName } : undefined,
    aggregateRating:
      product.reviewsCount > 0
        ? { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewsCount }
        : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: product.price.toFixed(2),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const store = getStoreBySlug(product.storeSlug);
  const related = getRelatedProducts(product);

  return (
    <div className="container-page py-8">
      <ProductJsonLd product={product} storeName={store?.name} />
      <nav className="mb-6 text-xs text-slate-500">
        <Link href="/" className="hover:text-brand-600">
          Início
        </Link>{" "}
        /{" "}
        <Link href="/produtos" className="hover:text-brand-600">
          Produtos
        </Link>{" "}
        / <span className="text-slate-700">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="grid gap-3 sm:grid-cols-2">
          {product.images.map((src, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-slate-100">
              <Image
                src={src}
                alt={`${product.name} - imagem ${i + 1}`}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </div>

        <div>
          {store && (
            <Link
              href={`/lojas/${store.slug}`}
              className="text-sm font-semibold uppercase tracking-wide text-brand-600 hover:underline"
            >
              {store.name}
            </Link>
          )}
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{product.name}</h1>

          <div className="mt-3 flex items-center gap-2 text-sm text-amber-500">
            {"★".repeat(Math.round(product.rating))}
            <span className="text-slate-500">({product.reviewsCount} avaliações)</span>
          </div>

          <div className="mt-4">
            {product.compareAtPrice && (
              <span className="mr-2 text-sm text-slate-400 line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
            <span className="text-3xl font-extrabold text-slate-900">{formatCurrency(product.price)}</span>
            <p className="mt-1 text-sm text-slate-600">
              {formatInstallments(product.price, product.installments.count)}
            </p>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-6">
            <ProductVariantSelector product={product} />
          </div>

          <ul className="mt-8 space-y-3 border-t border-slate-200 pt-6 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-brand-600" />
              {product.freeShipping ? "Frete grátis para todo o Brasil" : "Frete calculado no checkout"}
            </li>
            <li className="flex items-center gap-2">
              <Undo2 className="h-4 w-4 text-brand-600" />
              Primeira troca grátis em até 30 dias
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-600" />
              Compra 100% segura e dados protegidos
            </li>
          </ul>

          <div className="mt-6 border-t border-slate-200 pt-6">
            <h2 className="mb-2 text-sm font-semibold text-slate-900">Descrição</h2>
            <p className="text-sm text-slate-600">{product.description}</p>
            <ul className="mt-3 list-inside list-disc text-sm text-slate-600">
              {product.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-5 text-xl font-bold text-slate-900">Você também pode gostar</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
