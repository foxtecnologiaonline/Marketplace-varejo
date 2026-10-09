"use client";

import { CheckCircle2 } from "lucide-react";
import { stores } from "@/lib/data";
import { field, useFormSubmit } from "@/lib/use-form-submit";
import { submitQuoteRequest } from "@/app/cotacao/actions";

const inputClass = "rounded-md border border-slate-300 px-3 py-2 text-sm";

export function QuoteForm() {
  const { submitting, error, sent, setSent, onSubmit } = useFormSubmit((data) =>
    submitQuoteRequest({
      customerName: field(data, "customerName"),
      customerEmail: field(data, "customerEmail"),
      customerPhone: field(data, "customerPhone"),
      storeSlug: field(data, "storeSlug"),
      message: field(data, "message")
    })
  );

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
    <form onSubmit={onSubmit} className="card mt-6 flex flex-col gap-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="customerName" required maxLength={120} placeholder="Nome completo" className={inputClass} />
        <input name="customerPhone" required type="tel" maxLength={30} placeholder="WhatsApp" className={inputClass} />
      </div>
      <input name="customerEmail" required type="email" maxLength={254} placeholder="E-mail" className={inputClass} />
      <select name="storeSlug" required defaultValue="" aria-label="Loja ou colégio de interesse" className={inputClass}>
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
        maxLength={2000}
        rows={4}
        placeholder="Quantidade estimada, tamanhos e detalhes do pedido"
        className={inputClass}
      />

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? "Enviando..." : "Enviar solicitação"}
      </button>
    </form>
  );
}
