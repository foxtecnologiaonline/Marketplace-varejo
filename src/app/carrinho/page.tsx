"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useCartStore, cartTotals } from "@/lib/cart-store";
import { FREE_SHIPPING_THRESHOLD, MAX_ITEM_QUANTITY } from "@/lib/config";
import { products } from "@/lib/data";
import { formatCurrency } from "@/lib/format";
import { useHydrated } from "@/lib/use-hydrated";

export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCartStore();
  const hydrated = useHydrated();

  if (!hydrated) return null;

  const { subtotal } = cartTotals(items);
  const missingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  if (items.length === 0) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Seu carrinho está vazio</h1>
        <p className="mt-2 text-slate-600">Explore nossas lojas parceiras e encontre o uniforme ideal.</p>
        <Link href="/produtos" className="btn-primary mt-6 inline-flex">
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Carrinho</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-4">
          {items.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            if (!product) return null;
            return (
              <div key={`${item.productId}-${item.size}-${item.color}`} className="card flex gap-4 p-4">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-slate-100">
                  <Image src={product.images[0]!} alt={product.name} fill sizes="96px" className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link href={`/produtos/${product.slug}`} className="font-semibold text-slate-900 hover:text-brand-600">
                        {product.name}
                      </Link>
                      <p className="text-xs text-slate-500">
                        Tamanho: {item.size} · Cor: {item.color}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label="Remover item"
                      onClick={() => removeItem(item.productId, item.size, item.color)}
                      className="text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center rounded-md border border-slate-300">
                      <button
                        type="button"
                        className="px-2.5 py-1 text-base disabled:opacity-40"
                        disabled={item.quantity <= 1}
                        aria-label={`Diminuir quantidade de ${product.name}`}
                        onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        className="px-2.5 py-1 text-base disabled:opacity-40"
                        disabled={item.quantity >= MAX_ITEM_QUANTITY}
                        aria-label={`Aumentar quantidade de ${product.name}`}
                        onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="card h-fit p-5">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Resumo do pedido</h2>

          {missingForFreeShipping > 0 ? (
            <p className="mb-4 rounded-md bg-amber-50 p-3 text-xs text-amber-700">
              Faltam {formatCurrency(missingForFreeShipping)} para você ganhar frete grátis!
            </p>
          ) : (
            <p className="mb-4 rounded-md bg-emerald-50 p-3 text-xs text-emerald-700">
              Parabéns! Seu pedido tem frete grátis.
            </p>
          )}

          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          <Link href="/checkout" className="btn-primary mt-5 w-full">
            Finalizar compra
          </Link>
        </aside>
      </div>
    </div>
  );
}
