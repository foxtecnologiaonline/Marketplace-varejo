"use client";

import { field, useFormSubmit } from "@/lib/use-form-submit";
import { subscribeNewsletter } from "@/app/newsletter-actions";

export function NewsletterForm() {
  const { submitting, error, sent, onSubmit } = useFormSubmit((data) =>
    subscribeNewsletter({ email: field(data, "email") })
  );

  if (sent) {
    return <p className="text-sm font-semibold text-emerald-700">Pronto! Você vai receber nossas novidades.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-2 sm:w-auto">
      <div className="flex gap-2">
        <input
          name="email"
          type="email"
          required
          maxLength={254}
          aria-label="Seu e-mail"
          placeholder="seu@email.com"
          className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <button type="submit" disabled={submitting} className="btn-primary whitespace-nowrap">
          {submitting ? "Enviando..." : "Quero receber"}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
