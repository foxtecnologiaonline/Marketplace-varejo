"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { stores } from "@/lib/data";
import { submitQuoteRequest } from "@/app/cotacao/actions";

export function QuoteForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Captura a referência do form ANTES do await: o React invalida as
    // propriedades do SyntheticEvent (e.currentTarget vira null) assim que o
    // handler atravessa um ponto assíncrono, então usá-la depois do await falha.
    const formEl = e.currentTarget;
    setError(null);
    setSubmitting(true);

    const form = new FormData(formEl);
    const result = await submitQuoteRequest({
      customerName: String(form.get("customerName") ?? ""),
      customerEmail: String(form.get("customerEmail") ?? ""),
      customerPhone: String(form.get("customerPhone") ?? ""),
      storeSlug: String(form.get("storeSlug") ?? ""),
      message: String(form.get("message") ?? "")
    });

    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setSent(true);
    formEl.reset();
  }

  if (sent) {
    return (
      <div className="card mt-6 flex flex-col items-center gap-3 p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        <p className="font-semibold text-slate-900">Solicitação enviada!</p>
        <p className="text-sm text-slate-600">
          Nosso time comercial vai entrar em contato em até 1 dia útil.
        </p>
        <button type="button" onClick={() => setSent(false)} className="btn-secondary mt-2">
          Enviar outra solicitação
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card mt-6 flex flex-col gap-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          name="customerName"
          required
          placeholder="Nome completo"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          name="customerPhone"
          required
          type="tel"
          placeholder="WhatsApp"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <input
        name="customerEmail"
        required
        type="email"
        placeholder="E-mail"
        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
      />
      <select
        name="storeSlug"
        required
        defaultValue=""
        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
      >
        <option value="" disabled>
          Selecione a loja/colégio de interesse
        </option>
        {stores.map((s) => (
          <option key={s.slug} value={s.slug}>
            {s.name}
          </option>
        ))}
      </select>
      <textarea
        name="message"
        required
        placeholder="Quantidade estimada, tamanhos e detalhes do pedido"
        rows={4}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? "Enviando..." : "Enviar solicitação"}
      </button>
    </form>
  );
}
