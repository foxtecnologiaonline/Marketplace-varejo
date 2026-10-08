"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore, cartTotals } from "@/lib/cart-store";
import { calculateShipping, isValidCep } from "@/lib/shipping";
import { formatCurrency } from "@/lib/format";
import { submitCheckout } from "./actions";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clear } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cep, setCep] = useState("");

  useEffect(() => setMounted(true), []);

  const { subtotal } = cartTotals(items);
  const shipping = useMemo(
    () => (isValidCep(cep) ? calculateShipping(cep, subtotal) : null),
    [cep, subtotal]
  );
  const total = subtotal + (shipping?.cost ?? 0);

  if (!mounted) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(e.currentTarget);

    const result = await submitCheckout({
      customerName: String(form.get("customerName") ?? ""),
      customerEmail: String(form.get("customerEmail") ?? ""),
      customerPhone: String(form.get("customerPhone") ?? "") || undefined,
      cep: String(form.get("cep") ?? ""),
      city: String(form.get("city") ?? ""),
      street: String(form.get("street") ?? ""),
      complement: String(form.get("complement") ?? "") || undefined,
      items: items.map((i) => ({
        productId: i.productId,
        size: i.size,
        color: i.color,
        quantity: i.quantity
      }))
    });

    if (!result.success) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    clear();

    if (result.redirectUrl.startsWith("http")) {
      window.location.href = result.redirectUrl;
    } else {
      router.push(result.redirectUrl);
    }
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
            <legend className="mb-3 text-sm font-semibold text-slate-900">Seus dados</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="customerName" required placeholder="Nome completo" className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2" />
              <input name="customerEmail" required type="email" placeholder="E-mail" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input name="customerPhone" type="tel" placeholder="WhatsApp (opcional)" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </div>
          </fieldset>

          <fieldset className="card p-5">
            <legend className="mb-3 text-sm font-semibold text-slate-900">Endereço de entrega</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                name="cep"
                required
                placeholder="CEP"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input name="city" required placeholder="Cidade" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input name="street" required placeholder="Endereço" className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2" />
              <input name="complement" placeholder="Complemento" className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2" />
            </div>
            {cep && !isValidCep(cep) && (
              <p className="mt-2 text-xs text-amber-600">Digite um CEP válido para calcular o frete.</p>
            )}
          </fieldset>

          <div className="card p-5 text-sm text-slate-600">
            O pagamento (Pix ou cartão, em até 6x) é feito na próxima tela, pelo checkout seguro
            do Mercado Pago.
          </div>
        </div>

        <aside className="card h-fit p-5">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Resumo</h2>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="mt-1 flex justify-between text-sm text-slate-600">
            <span>{shipping?.label ?? "Frete"}</span>
            <span>{shipping ? formatCurrency(shipping.cost) : "informe o CEP"}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary mt-5 w-full">
            {submitting ? "Processando..." : "Ir para o pagamento"}
          </button>
        </aside>
      </form>
    </div>
  );
}
