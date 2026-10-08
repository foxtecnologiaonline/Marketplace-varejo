import { HeartHandshake, ShieldCheck, Sparkles, Truck } from "lucide-react";

const benefits = [
  { icon: Truck, title: "Envio para todo o Brasil", desc: "Entrega rastreada em todo o território nacional" },
  { icon: ShieldCheck, title: "Compra 100% segura", desc: "Pagamento protegido e dados criptografados" },
  { icon: HeartHandshake, title: "Atendimento humanizado", desc: "Time pronto para ajudar antes e depois da compra" },
  { icon: Sparkles, title: "Lojas parceiras oficiais", desc: "Produtos originais de colégios e marcas" }
];

export function BenefitsBar() {
  return (
    <section className="border-y border-slate-200 bg-white">
      <div className="container-page grid grid-cols-2 gap-6 py-8 sm:grid-cols-4">
        {benefits.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-left">
            <Icon className="h-8 w-8 shrink-0 text-brand-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">{title}</p>
              <p className="text-xs text-slate-500">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
