import Image from "next/image";
import Link from "next/link";
import { BenefitsBar } from "@/components/benefits-bar";
import { NewsletterForm } from "@/components/newsletter-form";
import { ProductCard } from "@/components/product-card";
import { categories, getFeaturedProducts, stores } from "@/lib/data";

export default function HomePage() {
  const featured = getFeaturedProducts(8);

  return (
    <div className="pb-16">
      <section className="bg-gradient-to-br from-brand-700 to-brand-900 text-white">
        <div className="container-page grid items-center gap-8 py-14 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-200">
              Blue Malharia — direto da malharia para você
            </p>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
              Encontre o uniforme do seu colégio em um só lugar
            </h1>
            <p className="mt-4 text-brand-100">
              Compra 100% segura, parcelamento sem juros e primeira troca grátis em todas as
              lojas parceiras.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/produtos" className="btn-primary bg-accent-500 hover:bg-accent-600">
                Ver todos os produtos
              </Link>
              <Link href="/cotacao" className="btn-secondary bg-white/10 text-white hover:bg-white/20">
                Pedir cotação institucional
              </Link>
            </div>
          </div>
          <div className="relative hidden aspect-[4/3] overflow-hidden rounded-xl sm:block">
            <Image
              src="https://images.unsplash.com/photo-1600857062241-98e5dba7f214?q=80&w=900&auto=format&fit=crop"
              alt="Alunos usando uniformes escolares"
              fill
              sizes="(min-width: 1280px) 600px, 50vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      <BenefitsBar />

      <section className="container-page py-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Compre pelo seu colégio</h2>
          <Link href="/lojas" className="text-sm font-semibold text-brand-600 hover:underline">
            Ver todas as lojas
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stores.map((store) => (
            <Link
              key={store.slug}
              href={`/lojas/${store.slug}`}
              className="card flex flex-col items-center gap-3 p-5 text-center transition hover:shadow-lg"
            >
              <div className="relative h-16 w-16 overflow-hidden rounded-full bg-slate-100">
                <Image src={store.logo} alt={store.name} fill sizes="64px" className="object-cover" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{store.name}</p>
                <p className="text-xs text-slate-500">{store.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page py-10">
        <h2 className="mb-5 text-xl font-bold text-slate-900">Categorias</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/produtos?categoria=${category.slug}`}
              className="group relative aspect-square overflow-hidden rounded-lg"
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="(min-width: 640px) 20vw, 50vw"
                className="object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/30" />
              <span className="absolute bottom-3 left-3 text-sm font-semibold text-white">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page py-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Lançamentos</h2>
          <Link href="/produtos" className="text-sm font-semibold text-brand-600 hover:underline">
            Ver tudo
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="container-page">
        <div className="card flex flex-col items-center gap-4 bg-brand-50 p-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Receba novidades e ofertas</h2>
            <p className="text-sm text-slate-600">
              Cadastre seu e-mail e fique por dentro dos lançamentos e promoções da Blue Malharia.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
