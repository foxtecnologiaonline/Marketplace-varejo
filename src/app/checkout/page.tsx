"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore, cartTotals } from "@/lib/cart-store";
import { products } from "@/lib/data";
import { formatCurrency } from "@/lib/format";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clear } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const { subtotal } = cartTotals(items);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      clear();
      router.push("/checkout/sucesso");
    }, 800);
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Carrinho vazio</h1>
        <p className="mt-2 text-slate-600">Adicione produtos antes de finalizar a compra.</p>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Finalizar compra</h1>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-6">
          <fieldset className="card p-5">
            <legend className="mb-3 text-sm font-semibold text-slate-900">Endereço de entrega</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <input required placeholder="Nome completo" className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2" />
              <input required placeholder="CEP" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input required placeholder="Cidade" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input required placeholder="Endereço" className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2" />
              <input placeholder="Complemento" className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2" />
            </div>
          </fieldset>

          <fieldset className="card p-5">
            <legend className="mb-3 text-sm font-semibold text-slate-900">Pagamento</legend>
            <div className="flex flex-col gap-2 text-sm text-slate-700">
              <label className="flex items-center gap-2">
                <input type="radio" name="pagamento" defaultChecked /> Cartão de crédito (até 6x sem juros)
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="pagamento" /> Pix (5% de desconto)
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="pagamento" /> Boleto bancário
              </label>
            </div>
          </fieldset>
        </div>

        <aside className="card h-fit p-5">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Resumo</h2>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary mt-5 w-full">
            {submitting ? "Processando..." : "Confirmar pedido"}
          </button>
        </aside>
      </form>
    </div>
  );
}
