"use client";

import { CheckCircle2 } from "lucide-react";
import { field, useFormSubmit } from "@/lib/use-form-submit";
import { submitSupportRequest } from "@/app/(institucional)/atendimento/actions";

const inputClass = "rounded-md border border-slate-300 px-3 py-2 text-sm";

export function SupportForm() {
  const { submitting, error, sent, setSent, onSubmit } = useFormSubmit((data) =>
    submitSupportRequest({
      customerName: field(data, "customerName"),
      customerEmail: field(data, "customerEmail"),
      message: field(data, "message")
    })
  );

  if (sent) {
    return (
      <div className="card flex max-w-xl flex-col items-center gap-3 p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        <p className="font-semibold text-slate-900">Mensagem enviada!</p>
        <p className="text-sm text-slate-600">Nossa equipe responde por e-mail em até 1 dia útil.</p>
        <button type="button" onClick={() => setSent(false)} className="btn-secondary mt-2">
          Enviar outra mensagem
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card flex max-w-xl flex-col gap-4 p-6">
      <input name="customerName" required maxLength={120} placeholder="Nome" className={inputClass} />
      <input name="customerEmail" required type="email" maxLength={254} placeholder="E-mail" className={inputClass} />
      <textarea name="message" required maxLength={2000} rows={4} placeholder="Como podemos ajudar?" className={inputClass} />

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? "Enviando..." : "Enviar mensagem"}
      </button>
    </form>
  );
}
