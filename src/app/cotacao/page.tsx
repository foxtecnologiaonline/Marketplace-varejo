import type { Metadata } from "next";
import { QuoteForm } from "@/components/quote-form";

export const metadata: Metadata = { title: "Cotação institucional" };

export default function QuotePage() {
  return (
    <div className="container-page py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900">Cotação institucional</h1>
        <p className="mt-2 text-slate-600">
          Escolas, times e empresas podem solicitar cotação de uniformes em volume, com valores e
          prazos sob consulta. Preencha o formulário e nosso time comercial responde em até 1 dia útil.
        </p>
        <QuoteForm />
      </div>
    </div>
  );
}
