"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore, cartTotals } from "@/lib/cart-store";
import { calculateShipping, isValidCep } from "@/lib/shipping";
import { formatCurrency } from "@/lib/format";
import { useHydrated } from "@/lib/use-hydrated";
import { lookupCep } from "@/lib/viacep";
import { submitCheckout } from "./actions";
import { previewCoupon } from "./coupon-actions";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clear } = useCartStore();
  const hydrated = useHydrated();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cep, setCep] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [cepLookup, setCepLookup] = useState<"idle" | "loading" | "found" | "not-found">("idle");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; description: string; discount: number } | null>(null);
  const [couponStatus, setCouponStatus] = useState<"idle" | "checking" | "error">("idle");
  const [couponError, setCouponError] = useState<string | null>(null);

  const { subtotal } = cartTotals(items);
  const shipping = useMemo(
    () => (isValidCep(cep) ? calculateShipping(cep, subtotal) : null),
    [cep, subtotal]
  );
  const discount = coupon?.discount ?? 0;
  const total = Math.max(0, subtotal + (shipping?.cost ?? 0) - discount);

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setCouponStatus("checking");
    setCouponError(null);
    const result = await previewCoupon(couponInput, subtotal, shipping?.cost ?? 0);
    if (!result.valid) {
      setCoupon(null);
      setCouponStatus("error");
      setCouponError(result.error);
      return;
    }
    setCoupon({ code: result.code, description: result.description, discount: result.discount });
    setCouponStatus("idle");
  }

  function handleRemoveCoupon() {
    setCoupon(null);
    setCouponInput("");
    setCouponStatus("idle");
    setCouponError(null);
  }

  // Autopreenche cidade/endereço pelo CEP (ViaCEP, API pública). Nunca sobrescreve o
  // que a pessoa já digitou: só preenche campos vazios, e ela pode sempre editar.
  useEffect(() => {
    if (!isValidCep(cep)) return;
    const controller = new AbortController();

    async function run() {
      setCepLookup("loading");
      const address = await lookupCep(cep, controller.signal);
      if (controller.signal.aborted) return;
      if (!address) {
        setCepLookup("not-found");
        return;
      }
      setCepLookup("found");
      setCity((current) => current || address.localidade);
      setStreet((current) => current || address.logradouro);
    }
    run();

    return () => controller.abort();
  }, [cep]);

  if (!hydrated) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const text = (name: string) => String(form.get(name) ?? "");

    try {
      const result = await submitCheckout({
        customerName: text("customerName"),
        customerEmail: text("customerEmail"),
        customerPhone: text("customerPhone") || undefined,
        cep: text("cep"),
        city: text("city"),
        street: text("street"),
        complement: text("complement") || undefined,
        couponCode: coupon?.code,
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
    } catch {
      // Falha de rede/servidor antes da resposta: sem isto o botão ficaria preso em "Processando...".
      setError("Não foi possível concluir seu pedido agora. Verifique sua conexão e tente novamente.");
      setSubmitting(false);
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
              <div>
                <input
                  name="cep"
                  required
                  placeholder="CEP"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
                {isValidCep(cep) && cepLookup === "loading" && (
                  <p className="mt-1 text-xs text-slate-500">Buscando endereço...</p>
                )}
                {isValidCep(cep) && cepLookup === "not-found" && (
                  <p className="mt-1 text-xs text-amber-600">CEP não encontrado, preencha manualmente.</p>
                )}
              </div>
              <input
                name="city"
                required
                placeholder="Cidade"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                name="street"
                required
                placeholder="Endereço"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
              />
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
          {coupon && (
            <div className="mt-1 flex justify-between text-sm text-emerald-600">
              <span>Cupom {coupon.code}</span>
              <span>-{formatCurrency(coupon.discount)}</span>
            </div>
          )}
          <div className="mt-2 flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>

          <div className="mt-4 border-t border-slate-200 pt-4">
            {coupon ? (
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="text-slate-600">{coupon.description}</span>
                <button type="button" onClick={handleRemoveCoupon} className="text-xs font-medium text-slate-500 underline">
                  Remover
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Cupom de desconto"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={couponStatus === "checking" || !couponInput.trim()}
                  className="btn-secondary px-3 py-2 text-xs"
                >
                  {couponStatus === "checking" ? "..." : "Aplicar"}
                </button>
              </div>
            )}
            {couponError && <p className="mt-1 text-xs text-red-600">{couponError}</p>}
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
