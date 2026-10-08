import type { Metadata } from "next";

export const metadata: Metadata = { title: "Lista de desejos" };

export default function WishlistPage() {
  return (
    <div className="container-page py-12">
      <h1 className="mb-4 text-2xl font-bold text-slate-900">Lista de desejos</h1>
      <p className="card p-8 text-center text-slate-500">
        Você ainda não adicionou produtos à sua lista de desejos.
      </p>
    </div>
  );
}
