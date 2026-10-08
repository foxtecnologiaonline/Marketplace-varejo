import Link from "next/link";
import { Heart, Search, ShoppingCart, User } from "lucide-react";
import { stores } from "@/lib/data";
import { CartIndicator } from "@/components/cart-indicator";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="container-page flex items-center gap-4 py-4">
        <Link href="/" className="shrink-0 text-xl font-extrabold tracking-tight text-brand-700">
          Varejo<span className="text-accent-500">+</span>
        </Link>

        <form action="/busca" className="hidden flex-1 items-center md:flex">
          <div className="relative w-full">
            <input
              type="search"
              name="q"
              placeholder="Buscar produtos, lojas ou colégios..."
              className="w-full rounded-md border border-slate-300 py-2.5 pl-4 pr-10 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-brand-600"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>

        <nav className="flex items-center gap-5 text-slate-700">
          <Link href="/conta" className="hidden items-center gap-1 text-sm font-medium hover:text-brand-600 sm:flex">
            <User className="h-5 w-5" />
            Minha conta
          </Link>
          <Link href="/favoritos" aria-label="Lista de desejos" className="hover:text-brand-600">
            <Heart className="h-5 w-5" />
          </Link>
          <Link href="/carrinho" aria-label="Carrinho" className="relative hover:text-brand-600">
            <ShoppingCart className="h-5 w-5" />
            <CartIndicator />
          </Link>
        </nav>
      </div>

      <form action="/busca" className="border-t border-slate-100 px-4 py-2 md:hidden">
        <div className="relative">
          <input
            type="search"
            name="q"
            placeholder="Buscar produtos..."
            className="w-full rounded-md border border-slate-300 py-2 pl-4 pr-10 text-sm"
          />
          <Search className="absolute inset-y-0 right-3 my-auto h-4 w-4 text-slate-500" />
        </div>
      </form>

      <nav className="hidden border-t border-slate-100 bg-slate-50 md:block">
        <div className="container-page flex items-center gap-6 overflow-x-auto py-2.5 text-sm font-medium text-slate-700">
          <Link href="/produtos" className="whitespace-nowrap hover:text-brand-600">
            Todos os produtos
          </Link>
          {stores.map((store) => (
            <Link
              key={store.slug}
              href={`/lojas/${store.slug}`}
              className="whitespace-nowrap hover:text-brand-600"
            >
              {store.name}
            </Link>
          ))}
          <Link href="/cotacao" className="ml-auto whitespace-nowrap font-semibold text-accent-600 hover:text-accent-500">
            Pedir cotação institucional
          </Link>
        </div>
      </nav>
    </header>
  );
}
