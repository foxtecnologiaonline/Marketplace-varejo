import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { getStoreBySlug, searchProducts, stores } from "@/lib/data";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return stores.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const store = getStoreBySlug(slug);
  return { title: store?.name ?? "Loja" };
}

export default async function StorePage({ params }: Props) {
  const { slug } = await params;
  const store = getStoreBySlug(slug);
  if (!store) notFound();

  const storeProducts = searchProducts({ store: store.slug });

  return (
    <div className="container-page py-8">
      <div className="card mb-8 flex flex-col items-center gap-4 p-6 sm:flex-row">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-slate-100">
          <Image src={store.logo} alt={store.name} fill sizes="80px" className="object-cover" />
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold text-slate-900">{store.name}</h1>
          <p className="text-slate-600">{store.description}</p>
        </div>
      </div>

      {storeProducts.length === 0 ? (
        <p className="text-slate-500">Nenhum produto cadastrado para esta loja ainda.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {storeProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
