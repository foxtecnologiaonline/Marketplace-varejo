import type { Metadata } from "next";

export const metadata: Metadata = { title: "Meus pedidos" };

export default function OrdersPage() {
  return (
    <div className="container-page py-12">
      <h1 className="mb-4 text-2xl font-bold text-slate-900">Meus pedidos</h1>
      <p className="card p-8 text-center text-slate-500">
        Você ainda não possui pedidos. Que tal explorar nossas lojas parceiras?
      </p>
    </div>
  );
}
