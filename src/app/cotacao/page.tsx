import type { Metadata } from "next";
import { stores } from "@/lib/data";

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

        <form className="card mt-6 flex flex-col gap-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <input required placeholder="Nome completo" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <input required type="tel" placeholder="WhatsApp" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <input required type="email" placeholder="E-mail" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
          <select required defaultValue="" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
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
            required
            placeholder="Quantidade estimada, tamanhos e detalhes do pedido"
            rows={4}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button type="submit" className="btn-primary">
            Enviar solicitação
          </button>
        </form>
      </div>
    </div>
  );
}
